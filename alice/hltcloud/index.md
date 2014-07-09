---
title: "ALICE HLT cloud"
layout: tweet

createtoc: true
parnumbers: true
---


Current status
--------------

| node     | type    | status            |
|----------|---------|-------------------|
| **cn43** | head    | *unconfigured*    |
| **cn44** | compute | *unconfigured*    |
| **cn45** | compute | *not accessible?* |
| **cn46** | compute | *unconfigured*    |
| **cn47** | compute | *unconfigured*    |

**OS:** Fedora 19. Will become CentOS 7 or similar in production.
RHEL 7 is derived from Fedora 19.

The */home* partition is exported via NFS.


### Network

* **10.162.128.X**: 1 GbE
* **10.162.130.X**: InfiniBand


Getting started
---------------

* Disable **NetworkManager** and enable **network**
* We are on Fedora 19: we need to turn off **firewalld** and enable
  **iptables** instead


Head node configuration
-----------------------


### Backing database

Install [MariaDB](https://mariadb.org/) server and the Python MySQL
interface:

```bash
yum install mariadb-server MySQL-python
```

**Note:** on Fedora 19, *mariadb-server* replaces *mysql-server* by
default.

Add the following lines to `/etc/my.cnf` (set the `bind-address`
appropriately, *i.e.* the IP address of the current node):

```ini
# [dberzano] for openstack #
bind-address=10.162.128.63
default-storage-engine = innodb
innodb_file_per_table
collation-server = utf8_general_ci
init-connect = 'SET NAMES utf8'
character-set-server = utf8
# [/dberzano] for openstack #
```

Start MySQL and do it automatically from now on:

```bash
service mysqld start
chkconfig mysqld on
```

Decide a random root password for MySQL; for instance, copy and paste
the following:

```bash
openssl rand -hex 10
```

Configure MySQL securely:

```bash
mysql_secure_installation
```

**Note:** the first time you run it, the default root password is not
set.

Answer **yes** to all questions.


### OpenStack packages

Icehouse has no Fedora 19 builds. We use the Fedora 20 builds instead
and see what happens.

Enable the Yum priorities plugin:

```bash
yum install yum-priorities-plugin
```

Configure the RDO repo:

```bash
yum install http://repos.fedorapeople.org/repos/openstack/openstack-icehouse/rdo-release-icehouse-3.noarch.rpm
```

Open the `/etc/yum.repos.d/rdo-release.repo` file and change a couple
of lines:

```ini
baseurl=http://repos.fedorapeople.org/repos/openstack/openstack-icehouse/fedora-20/
priority=1 # highest
```

We now need a hack: Fedora has a *python-oslo-config* package which is
outdated (1.1.X). We need at least 1.2. Download the RPM from
[here](http://www.rpmfind.net//linux/RPM/fedora/20/x86_64/p/python-oslo-config-1.2.0-0.5.a3.fc20.noarch.html)
([this](http://www.rpmfind.net/linux/rpm2html/search.php?query=python-oslo-config&submit=Search+...&system=fedora&arch=) was the corresponding search).

The direct link to the RPM is contained in the following long command:

```bash
wget ftp://fr2.rpmfind.net/linux/fedora/linux/releases/20/Everything/x86_64/os/Packages/p/python-oslo-config-1.2.0-0.5.a3.fc20.noarch.rpm
yum localinstall python-oslo-config*
```

Install OpenStack utilities:

```bash
yum install openstack-utils
```

**Note:** we don't install the `openstack-selinux` package on Fedora
(there isn't one).


### Messaging server

We use [Apache Qpid](http://qpid.apache.org/) as messaging server:

```bash
yum install qpid-cpp-server
```

Disable authentication: in `/etc/qpidd.conf` add a line:

```ini
auth=no
```

**Note:** this is OK since we are in a protected environment and our
VMs will be in a separate network.

Start it now, and at every boot:

```bash
service qpidd start
chkconfig qpidd on
```


### Keystone: identity server

Do:

```bash
yum install openstack-keystone python-keystoneclient
```

**Note:** you must have an appropriate version of `python-oslo-config`
and the default one of Fedora 19 is outdated.

Generate a random password for Keystone and take note of it:

```bash
openssl rand -hex 10
```

Now set up the MySQL database for Keystone. Do:

```bash
mysql -u root -p
```

Use the root password you have set when configuring MySQL. At the
MySQL prompt:

```mysql
CREATE DATABASE keystone ;
GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'localhost' IDENTIFIED BY '<KEYSTONE_DBPASS>' ;
GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'%' IDENTIFIED BY '<KEYSTONE_DBPASS>' ;
```

**Note:** you must use the random password instead of `<KEYSTONE_DBPASS>`.

Time to open `/etc/keystone/keystone.conf`. Create another random
password using `openssl` and use it as admin token:

```ini
[DEFAULT]
admin_token = <ADMIN_TOKEN>
```

In the same configuration file, set up the MySQL password for the
*keystone* user of MySQL (the one you've generated at the beginning
of this paragraph):

```ini
[database]
connection = mysql://keystone:<KEYSTONE_DBPASS>@localhost/keystone
```

Create keys:

```bash
keystone-manage pki_setup --keystone-user keystone --keystone-group keystone
chown -R keystone:keystone /etc/keystone/ssl
chmod -R o-rwx /etc/keystone/ssl
```

Do this (in fact this is not needed if the subsequent operation does
not fail!):

```bash
chgrp keystone /var/log/keystone/keystone.log
chmod 0660 /var/log/keystone/keystone.log
```

Then sync the database tables as user *keystone*:

```bash
su -s /bin/sh -c "keystone-manage db_sync" keystone
```

Configure automatic purge of old tokens (one-liner):

```bash
(crontab -l -u keystone 2>&1 | grep -q token_flush) || \
echo '@hourly /usr/bin/keystone-manage token_flush >/var/log/keystone/keystone-tokenflush.log 2>&1' >> /var/spool/cron/keystone
```

Start Keystone now and at every boot:

```bash
service openstack-keystone start
chkconfig openstack-keystone on
```


#### Create users and tenants

In your environment (you're on the head node):

```bash
export OS_SERVICE_TOKEN=<ADMIN_TOKEN>
export OS_SERVICE_ENDPOINT=http://localhost:35357/v2.0
```

The administrative token is used only for administrative operations.

Create an admin:

```bash
keystone user-create --name=admin --pass=<ADMIN_PASS> --email=dario.berzano@cern.ch
```

**Beware:** `<ADMIN_PASS>` is **another** random string, different
from `<ADMIN_TOKEN>`.

Now we create the *admin* role, the *admin* tenant, we link them
together, and we do the same with the *_member_* role, which is one
of the default ones. From the OpenStack doc:

```bash
keystone role-create --name=admin
keystone tenant-create --name=admin --description="Admin Tenant"
keystone user-role-add --user=admin --tenant=admin --role=admin
keystone user-role-add --user=admin --role=_member_ --tenant=admin
```

We now create a normal user (*demo*) and a *demo* tenant:

```bash
keystone user-create --name=demo --pass=<DEMO_PASS> --email=dario.berzano@cern.ch
keystone tenant-create --name=demo --description="Demo Tenant"
keystone user-role-add --user=demo --role=_member_ --tenant=demo
```

A service tenant is needed for the services to communicate between
them:

```bash
keystone tenant-create --name=service --description="Service Tenant"
```

That is it.


#### Define services and API URLs

> For the following commands to work, just like the previous step, we
> need the `OS_SERVICE_TOKEN` environment variable set to the
> `<ADMIN_TOKEN>`.

OpenStack is made of intercommunicating *services*. Each service needs
to authenticate to the *identity service*, and has a HTTP-based API
with an appropriate URL endpoint.

The **identity service** itself is a service that must be registered:

```bash
keystone service-create --name=keystone --type=identity --description="OpenStack Identity"
```

The **endpoint URL for the API** must be manually created:

```bash
keystone endpoint-create \
  --service-id=$(keystone service-list | awk '/ identity / {print $2}') \
  --publicurl=http://cn43.internal:5000/v2.0 \
  --internalurl=http://cn43.internal:5000/v2.0 \
  --adminurl=http://cn43.internal:35357/v2.0
```

> *cn43.internal* is the FQDN of the test controller node in the HLT
> network. `hostname -f` correctly works.

To test whether the identity service works:

```bash
unset OS_SERVICE_TOKEN OS_SERVICE_ENDPOINT
keystone --os-username=admin --os-password=<ADMIN_PASS> --os-auth-url=http://cn43.internal:35357/v2.0 token-get
```

You can try with the wrong `<ADMIN_PASS>` to make sure it *does not*
work in such case:

```console
$> keystone --os-username=admin --os-password=THISISTHEWRONGPASSWORD --os-auth-url=http://cn43.internal:35357/v2.0 token-get
The request you have made requires authentication. (HTTP 401)
```

You don't need to be root to contact the services. We create a small
template script to enter the appropriate environment (let's call it
`enter-openstack.sh`:

```bash
#!/bin/bash

function pe() {
  echo -e "\033[1m$1\033[m"
}

if [ "$1" == '' ] ; then
  pe "Usage: $0 <OpenStackProfileName>"
  exit 1
fi

# common exports
export OS_AUTH_URL=http://cn43.internal:35357/v2.0

case "$1" in

  admin)
    export OS_USERNAME=admin
    export OS_PASSWORD=<ADMIN_PASS>
    export OS_TENANT_NAME=admin
  ;;

  *)
    pe "Unknown profile: $1"
    exit 2
  ;;

esac

pe 'Your shell has the OpenStack environment. Exit it to purge OpenStack variables.'
exec bash --rcfile <( cat ~/.bashrc ; echo -e "\nexport PS1=\"user:$OS_USERNAME / tenant:$OS_TENANT_NAME\n[OpenStack] \$PS1\"\n" )
```

Then, as normal user, we enter the environment and check that we have
admin permissions for real:

```bash
$> enter-openstack.sh admin
Your shell has the OpenStack environment. Exit it to purge OpenStack variables.
user:admin / tenant:admin

$> keystone user-list
...

$> keystone user-role-list --user admin --tenant admin
...
```


### Glance: the image service

The image service (Glance) is a registry of the available images. We
are configuring Glance to use:

* MySQL as the database for metadata
* NFS as storage for the images

It is convenient to use NFS because it is already there. On the head
node:

```bash
yum install openstack-glance python-glanceclient
```

Generate a password with the usual command: we are going to use it as
`<GLANCE_DBPASS>` for the MySQL database access of the Glance service:

```bash
openssl rand -hex 10
```

Configure the MySQL database:

```bash
mysql -u root -p
```

Then at the `mysql>` prompt:

```mysql
CREATE DATABASE glance ;
GRANT ALL PRIVILEGES ON glance.* TO 'glance'@'localhost' IDENTIFIED BY '<GLANCE_DBPASS>' ;
GRANT ALL PRIVILEGES ON glance.* TO 'glance'@'%' IDENTIFIED BY '<GLANCE_DBPASS>' ;
```

Store credentials in the configuration files of Glance:

```bash
openstack-config --set /etc/glance/glance-api.conf database connection mysql://glance:<GLANCE_DBPASS>@localhost/glance
openstack-config --set /etc/glance/glance-registry.conf database connection mysql://glance:<GLANCE_DBPASS>@localhost/glance
```

*Note:* we are using *localhost* for the connections to the database.
We don't need the full host name *(cn43.internal)*.

Just like Keystone, Glance has its user. Create the tables:

```bash
su -s /bin/sh -c "glance-manage db_sync" glance
```

Now create a new password for a *glance* user in OpenStack. We will
refer to it as `<GLANCE_PASS>`, which is different from the database
password `<GLANCE_DBPASS>`.

As **normal** Unix user, in the OpenStack environment for *admin*:

```bash
keystone user-create --name=glance --pass=<GLANCE_PASS> --email=dario.berzano@cern.ch
keystone user-role-add --user=glance --tenant=service --role=admin
```

Then, we need to run this very long list of commands, as root. Just
replace:

* `cn43.internal` with the controller's FQDN
* `<GLANCE_PASS>` with the OpenStack password for the *glance* user

```bash
openstack-config --set /etc/glance/glance-api.conf keystone_authtoken auth_uri http://cn43.internal:5000
openstack-config --set /etc/glance/glance-api.conf keystone_authtoken auth_host cn43.internal
openstack-config --set /etc/glance/glance-api.conf keystone_authtoken auth_port 35357
openstack-config --set /etc/glance/glance-api.conf keystone_authtoken auth_protocol http
openstack-config --set /etc/glance/glance-api.conf keystone_authtoken admin_tenant_name service
openstack-config --set /etc/glance/glance-api.conf keystone_authtoken admin_user glance
openstack-config --set /etc/glance/glance-api.conf keystone_authtoken admin_password <GLANCE_PASS>
openstack-config --set /etc/glance/glance-api.conf paste_deploy flavor keystone
openstack-config --set /etc/glance/glance-registry.conf keystone_authtoken auth_uri http://cn43.internal:5000
openstack-config --set /etc/glance/glance-registry.conf keystone_authtoken auth_host cn43.internal
openstack-config --set /etc/glance/glance-registry.conf keystone_authtoken auth_port 35357
openstack-config --set /etc/glance/glance-registry.conf keystone_authtoken auth_protocol http
openstack-config --set /etc/glance/glance-registry.conf keystone_authtoken admin_tenant_name service
openstack-config --set /etc/glance/glance-registry.conf keystone_authtoken admin_user glance
openstack-config --set /etc/glance/glance-registry.conf keystone_authtoken admin_password <GLANCE_PASS>
openstack-config --set /etc/glance/glance-registry.conf paste_deploy flavor keystone
```

We need now to create the Image Service in OpenStack. As *normal* user
with the *admin* token:

```bash
keystone service-create --name=glance --type=image \
  --description="OpenStack Image Service"
```

If it goes right:

```bash
keystone endpoint-create \
  --service-id=$(keystone service-list | awk '/ image / {print $2}') \
  --publicurl=http://cn43.internal:9292 \
  --internalurl=http://cn43.internal:9292 \
  --adminurl=http://cn43.internal:9292
```

We now need to start the Glance services and tell the system to start
them at boot as well. As root:

```bash
service openstack-glance-api start
service openstack-glance-registry start
chkconfig openstack-glance-api on
chkconfig openstack-glance-registry on
```

As suggested on the upstream guide,
[verify the Image Service](http://docs.openstack.org/icehouse/install-guide/install/yum/content/glance-verify.html) by registering a new image:

```bash
wget http://cdn.download.cirros-cloud.net/0.3.2/cirros-0.3.2-x86_64-disk.img
glance image-create --name='CirrOS Test Image' --disk-format='qcow2' --container-format='bare' --is-public='true' < cirros-0.3.2-x86_64-disk.img
```

Please note that by default the image ends up in
`/var/lib/glance/images/`.

> We will set it up to use NFS instead (probably).


Client node configuration
-------------------------

Clients can be installed on any machine that can access the head node
(currently, *cn43.internal*).

We are going to install them on the head node itself for starters.

```bash
yum install python-novaclient python-glanceclient
```

Verify that the package you are explicitly installing is being
obtained from the *openstack-icehouse* repository.


Questions
---------

* DHCP: configure address class for the VMs
* Install spare disks for LVM block storage
* IPMI access: I have to touch the network


Resources
---------

* [OpenStack Icehouse with RPMs](http://docs.openstack.org/icehouse/install-guide/install/yum/content/)
* [OpenStack releases](https://wiki.openstack.org/wiki/Releases)
* [Install OpenStack Icehouse from CERN IT](http://information-technology.web.cern.ch/book/cern-cloud-infrastructure-user-guide/advanced-topics/installing-openstack#icehouse)
