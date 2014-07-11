---
title: "ALICE HLT cloud"
layout: tweet

createtoc: true
parnumbers: true
---


Current status
--------------

| Node     | Type    | Status            |
|----------|---------|-------------------|
| **cn43** | head    | *configured*      |
| **cn44** | compute | *configured*      |
| **cn45** | compute | *configured*      |
| **cn46** | compute | *unconfigured*    |
| **cn47** | compute | *unconfigured*    |

**OS:** Fedora 19. Will become CentOS 7 or similar in production.
RHEL 7 is derived from Fedora 19.

The */home* partition is exported via NFS.


### Network

* **10.162.128.X**: 1 GbE
* **10.162.130.X**: InfiniBand

DNS resolutions (IPv4):

* **cnXX.internal**: Ethernet interfaces
* **cnXX-mgmt.internal**: IPMI (remote management)
* **cnXX-ib.internal**: InfiniBand **(does not work yet)**


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
yum install yum-plugin-priorities
```

Configure the RDO repo:

```bash
yum install http://repos.fedorapeople.org/repos/openstack/openstack-icehouse/rdo-release-icehouse-3.noarch.rpm
```

Open the `/etc/yum.repos.d/rdo-release.repo` file and change a couple
of lines:

```ini
baseurl=http://repos.fedorapeople.org/repos/openstack/openstack-icehouse/fedora-20/
# highest prio
priority=1
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


### Compute: Nova management

The Compute service needs a controller on the head node:

```bash
yum install openstack-nova-api openstack-nova-cert openstack-nova-conductor \
  openstack-nova-console openstack-nova-novncproxy openstack-nova-scheduler \
  python-novaclient
```

Once again, generate a new `<NOVA_PASS>` with the corresponding
OpenStack user, and a `<NOVA_DBPASS>` for the database support.

```bash
NOVA_PASS=$( openssl rand -hex 10 )
NOVA_DBPASS=$( openssl rand -hex 10 )
THIS_IP=10.162.128.63

echo NOVA_PASS=$NOVA_PASS
echo NOVA_DBPASS=$NOVA_DBPASS

openstack-config --set /etc/nova/nova.conf database connection mysql://nova:${NOVA_DBPASS}@localhost/nova

openstack-config --set /etc/nova/nova.conf DEFAULT rpc_backend qpid
openstack-config --set /etc/nova/nova.conf DEFAULT qpid_hostname localhost

openstack-config --set /etc/nova/nova.conf DEFAULT my_ip $THIS_IP
openstack-config --set /etc/nova/nova.conf DEFAULT vncserver_listen $THIS_IP
openstack-config --set /etc/nova/nova.conf DEFAULT vncserver_proxyclient_address $THIS_IP

T=$(mktemp)
cat > $T <<EOF
CREATE DATABASE nova ;
GRANT ALL PRIVILEGES ON nova.* TO 'nova'@'localhost' IDENTIFIED BY '$NOVA_DBPASS';
GRANT ALL PRIVILEGES ON nova.* TO 'nova'@'%' IDENTIFIED BY '$NOVA_DBPASS' ;
SELECT host,user,password from mysql.user ;
EOF
cat $T

mysql -u root -p < $T

rm -f $T
unset T

su -s /bin/sh -c "nova-manage db sync" nova

openstack-config --set /etc/nova/nova.conf DEFAULT auth_strategy keystone
openstack-config --set /etc/nova/nova.conf keystone_authtoken auth_uri http://cn43.internal:5000
openstack-config --set /etc/nova/nova.conf keystone_authtoken auth_host cn43.internal
openstack-config --set /etc/nova/nova.conf keystone_authtoken auth_protocol http
openstack-config --set /etc/nova/nova.conf keystone_authtoken auth_port 35357
openstack-config --set /etc/nova/nova.conf keystone_authtoken admin_user nova
openstack-config --set /etc/nova/nova.conf keystone_authtoken admin_tenant_name service
openstack-config --set /etc/nova/nova.conf keystone_authtoken admin_password $NOVA_PASS
```

Now, time to become unprivileged. Load the admin environment of
OpenStack, then:

```bash
keystone user-create --name=nova --pass=<NOVA_PASS> --email=dario.berzano@cern.ch
keystone user-role-add --user=nova --tenant=service --role=admin

keystone service-create --name=nova --type=compute --description="OpenStack Compute"
keystone endpoint-create \
  --service-id=$(keystone service-list | awk '/ compute / {print $2}') \
  --publicurl=http://cn43.internal:8774/v2/%\(tenant_id\)s \
  --internalurl=http://cn43.internal:8774/v2/%\(tenant_id\)s \
  --adminurl=http://cn43.internal:8774/v2/%\(tenant_id\)s
```

Go back to your root console:

```bash
service openstack-nova-api start
service openstack-nova-cert start
service openstack-nova-consoleauth start
service openstack-nova-scheduler start
service openstack-nova-conductor start
service openstack-nova-novncproxy start
chkconfig openstack-nova-api on
chkconfig openstack-nova-cert on
chkconfig openstack-nova-consoleauth on
chkconfig openstack-nova-scheduler on
chkconfig openstack-nova-conductor on
chkconfig openstack-nova-novncproxy on
```

### Firewall

Install a graphical tool to ease this pain:

```bash
yum install firewall-config
```

The full list of ports is shown
[here](http://docs.openstack.org/icehouse/config-reference/content/firewalls-default-ports.html).

| Port      | Service           | Head | Work |
|:---------:|-------------------|:----:|:----:|
| 8776      | Block storage     |   ?  |      |
| 8774      | Compute endpoints |   ✔  |      |
| 8773,8775 | Compute API       |   ✔  |      |
| 5900-5999 | VNC               |      |   ✔  |
| 6080      | novnc browser     |   ✔  |      |
| 6081      | Normal VNC proxy  |   ?  |      |
| 6082      | Compute HTML5 pxy |   ?  |   ?  |
| 35357     | Keystone admin    |   ?  |      |
| 5000      | Keystone public   |   ✔  |      |
| 9292      | Glance API        |   ✔  |      |
| 9191      | Glance registry   |   ?  |   ?  |
| 9696      | Neutron           |   ?  |   ?  |
| 5672      | Qpid              |   ✔  |      |

* **✔**: needed and in place
* **?**: not sure if needed, kept closed for the moment
* *(empty)*: not needed and not in place


### Legacy networking

This is the controller part for the legacy networking. "Legacy" means
that it is *not* handled by OpenStack, but it relies mostly on the
existing hardware infrastructure.

To enable legacy networking, edit the configuration files as **root**:

```bash
openstack-config --set /etc/nova/nova.conf DEFAULT network_api_class nova.network.api.API
openstack-config --set /etc/nova/nova.conf DEFAULT security_group_api nova
```

Then restart (always as **root**) the Compute services:

```bash
service openstack-nova-api restart
service openstack-nova-scheduler restart
service openstack-nova-conductor restart
```


Workers configuration
---------------------

Workers are called the Compute nodes, in OpenStack's speech. Sample
installation targets *cn44.internal*.

This installation should be automated using Puppet.

We are using KVM as hypervisor.


### The Compute service

Configure the RDO repo:

```bash
yum install http://repos.fedorapeople.org/repos/openstack/openstack-icehouse/rdo-release-icehouse-3.noarch.rpm
```

Open the `/etc/yum.repos.d/rdo-release.repo` file and change a couple
of lines:

```ini
baseurl=http://repos.fedorapeople.org/repos/openstack/openstack-icehouse/fedora-20/
# highest prio
priority=1
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

Now install the compute service and utilities:

```bash
yum install openstack-nova-compute openstack-utils --disablerepo=slc6-*
```

**Note:** we had to disable all the slc6 repositories because they
cause problems. They are actually hosted on *head.internal*, but some
files can just not be found.

```bash
openstack-config --set /etc/nova/nova.conf database connection mysql://nova:<NOVA_DBPASS>@cn43.internal/nova
openstack-config --set /etc/nova/nova.conf DEFAULT auth_strategy keystone
openstack-config --set /etc/nova/nova.conf keystone_authtoken auth_uri http://cn43.internal:5000
openstack-config --set /etc/nova/nova.conf keystone_authtoken auth_host cn43.internal
openstack-config --set /etc/nova/nova.conf keystone_authtoken auth_protocol http
openstack-config --set /etc/nova/nova.conf keystone_authtoken auth_port 35357
openstack-config --set /etc/nova/nova.conf keystone_authtoken admin_user nova
openstack-config --set /etc/nova/nova.conf keystone_authtoken admin_tenant_name service
openstack-config --set /etc/nova/nova.conf keystone_authtoken admin_password <NOVA_PASS>
```

Remember that Qpid is our broker. Set it:

```bash
openstack-config --set /etc/nova/nova.conf DEFAULT rpc_backend qpid
openstack-config --set /etc/nova/nova.conf DEFAULT qpid_hostname cn43.internal
```

Get the Compute node IP, then:

```bash
THIS_IP=10.162.128.64
openstack-config --set /etc/nova/nova.conf DEFAULT my_ip $THIS_IP
openstack-config --set /etc/nova/nova.conf DEFAULT vnc_enabled True
openstack-config --set /etc/nova/nova.conf DEFAULT vncserver_listen 0.0.0.0
openstack-config --set /etc/nova/nova.conf DEFAULT vncserver_proxyclient_address $THIS_IP
openstack-config --set /etc/nova/nova.conf DEFAULT novncproxy_base_url http://cn43.internal:6080/vnc_auto.html
```

And for the image service:

```bash
openstack-config --set /etc/nova/nova.conf DEFAULT glance_host cn43.internal
```

Configure this node as a QEmu node:

```bash
openstack-config --set /etc/nova/nova.conf libvirt virt_type qemu
```

Start services:

```
service libvirtd start
service dbus start
service openstack-nova-compute start
chkconfig libvirtd on
chkconfig dbus on
chkconfig openstack-nova-compute on
```

**Note:** dbus will complain, but it should not be a problem.


### Legacy networking

Legacy networking is handled mostly by the hypervisors.

> Our configuration will have a bridge named **br100** on the Ethernet
> network (not the InfiniBand one).


#### Disable any fancy network managers

Create a root password, and use it to login via a remote management
console.

Then:

```bash
service NetworkManager stop
service network start
chkconfig NetworkManager off
chkconfig network on
```


#### Create a network bridge containing the current interface

> The network interface is **em1** and we are not using IPv6.

Disable permanently IPv6. As **root**:

```bash
echo 'net.ipv6.conf.all.disable_ipv6=1' > /etc/sysctl.d/disable_ipv6.conf
```

Then reboot. After the reboot, go to `/etc/sysconfig/network-scripts`.
Make a backup copy of `ifcfg-em1`, just in case.

Create now a new `ifcfg-em1`:

```bash
UUID=cb6a015a-cc2c-4cd4-bfd9-cff7497c9a05
DEVICE=em1
HWADDR=00:30:48:C9:A2:4A
ONBOOT=yes
BOOTPROTO=none
TYPE=Ethernet
USERCTL=no
PEERDNS=yes
IPV6INIT=no
BRIDGE=br100
DEFROUTE=no
PEERROUTES=yes
IPV4_FAILURE_FATAL=no
NAME="System em1"
```

Now, for the bridge, `ifcfg-br100`:

```
DEVICE=br100
TYPE=Bridge
ONBOOT=Yes
BOOTPROTO=dhcp
PERSISTENT_DHCLIENT=1
IPV6INIT=no
```

Do, **not from a SSH terminal**:

```bash
service network restart
```

Check that everything went right. The interface **em1** should have no
IP address, while the bridge **br100** should have one.

```console
#> for i in em1 br100 ; do ifconfig $i ; done
em1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        ether 00:30:48:c9:a2:4a  txqueuelen 1000  (Ethernet)
        RX packets 4390  bytes 1373553 (1.3 MiB)
        RX errors 0  dropped 14  overruns 0  frame 0
        TX packets 4607  bytes 823184 (803.8 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device memory 0xfbc60000-fbc80000

br100: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.162.128.64  netmask 255.255.255.0  broadcast 10.162.128.255
        ether 00:30:48:c9:a2:4a  txqueuelen 0  (Ethernet)
        RX packets 1672  bytes 160577 (156.8 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 2025  bytes 277462 (270.9 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```


#### OpenStack daemons

**Remember:** our network bridge is **br100** while the physical
interface is called **em1** (and it is part of the bridge). The
following configuration will use those values, substitute them to
match your configuration!

Install some required packages:

```bash
yum install openstack-nova-network openstack-nova-api
```

On the compute node, edit the configuration files as **root**:

```bash
openstack-config --set /etc/nova/nova.conf DEFAULT network_api_class nova.network.api.API
openstack-config --set /etc/nova/nova.conf DEFAULT security_group_api nova
openstack-config --set /etc/nova/nova.conf DEFAULT network_manager nova.network.manager.FlatDHCPManager
openstack-config --set /etc/nova/nova.conf DEFAULT firewall_driver nova.virt.libvirt.firewall.IptablesFirewallDriver
openstack-config --set /etc/nova/nova.conf DEFAULT network_size 254
openstack-config --set /etc/nova/nova.conf DEFAULT allow_same_net_traffic False
openstack-config --set /etc/nova/nova.conf DEFAULT multi_host True
openstack-config --set /etc/nova/nova.conf DEFAULT send_arp_for_ha True
openstack-config --set /etc/nova/nova.conf DEFAULT share_dhcp_address True
openstack-config --set /etc/nova/nova.conf DEFAULT force_dhcp_release True
openstack-config --set /etc/nova/nova.conf DEFAULT flat_network_bridge br100
openstack-config --set /etc/nova/nova.conf DEFAULT flat_interface em1
openstack-config --set /etc/nova/nova.conf DEFAULT public_interface em1
```

Start the services:

```bash
service openstack-nova-network start
service openstack-nova-metadata-api start
chkconfig openstack-nova-network on
chkconfig openstack-nova-metadata-api on
```


#### Prevent losing bridge configuration

In our setup we use a single bridge interface named **br100** with
multiple IP addresses:

* the main management address of the hypervisor *(e.g. 10.162.128.64)*
* any other gateway address for the OpenStack Flat Network
  configuration *(e.g. 203.0.113.25)*

The additional addresses are eliminated when no more VMs needing that
network run there.

The primary address in our setup is assigned via a DHCP: so it has to
be renewed from time to time.

Whenever you restart the network:

```bash
service network restart
```

or whenever the DHCP lease is renewed, *all other IP addresses other
than the DHCP one are eliminated from the interface*.

To work around that, we create a hook for dhclient:

```bash
echo 'systemctl restart openstack-nova-network.service' > /etc/dhcp/dhclient-exit-hooks
chmod +x /etc/dhcp/dhclient-exit-hooks
```

The appropriate network configuration will be restored as soon as a
new DHCP address is obtained.

> **Note:** this solution blocks the boot process!


#### Create a demo network

Go to **cn43.internal** as **normal** user and load the OpenStack
**admin** environment.

Run:

```bash
nova network-create demo-net --bridge br100 --multi-host T --fixed-range-v4 203.0.113.24/29
```

This creates a demo network named **demo-neet** with the following
features:

* it expects to have bridges named **br100** on the hypervisors
* it uses a load-balancing feature called multi-host
* it gives IPv4 addresses from **203.0.113.24** to **203.0.113.32**

Check:

```console
$> nova network-list
+--------------------------------------+----------+-----------------+
| ID                                   | Label    | Cidr            |
+--------------------------------------+----------+-----------------+
| 59a8f0d2-d2da-4473-a82e-3e45e47fdb9a | demo-net | 203.0.113.24/29 |
+--------------------------------------+----------+-----------------+
```


#### Run your first virtual machine

As your **normal** user, create a keypair:

```bash
ssh-keygen
nova keypair-add --pub-key demo-key.pub demo-key
```

Launch the VM:

```bash
nova boot \
  --flavor m1.tiny \
  --image 'CirrOS Test Image' \
  --nic net-id='59a8f0d2-d2da-4473-a82e-3e45e47fdb9a' \
  --security-group default \
  --key-name demo-key demo-inst1
```

The VM will (hopefully) successfully launch. For two VMs:

```console
$> nova list
+--------------------------------------+------------+--------+------------+-------------+-----------------------+
| ID                                   | Name       | Status | Task State | Power State | Networks              |
+--------------------------------------+------------+--------+------------+-------------+-----------------------+
| 58df4a92-b97a-4a2a-baa9-afdf5a9d230d | demo-inst1 | ACTIVE | -          | Running     | demo-net=203.0.113.27 |
| d25f36db-bc16-496f-a8be-d438c2da77f8 | demo-inst2 | ACTIVE | -          | Running     | demo-net=203.0.113.26 |
+--------------------------------------+------------+--------+------------+-------------+-----------------------+
```

What happened to the network? Log in to the Compute node (for the
moment, it's only **cn44.internal**) and run:

```console
#> # for i in em1 br100 ; do ip address list $i ; done
2: em1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq master br100 state UP qlen 1000
    link/ether 00:30:48:c9:a2:4a brd ff:ff:ff:ff:ff:ff
7: br100: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP
    link/ether 00:30:48:c9:a2:4a brd ff:ff:ff:ff:ff:ff
    inet 203.0.113.25/29 brd 203.0.113.31 scope global br100
       valid_lft forever preferred_lft forever
    inet 10.162.128.64/24 brd 10.162.128.255 scope global br100
       valid_lft forever preferred_lft forever
```

> *ifconfig* will not show you all the addresses associated to a
> certain network interface and it is considered "legacy".

You can see that:

* your interface **em1** has been left untouched
* the interface **br100** has *two* IP addresses:
 * the hypervisor's address: **10.162.128.64**
 * the VM gateway's address: **203.0.113.25**

Ok, can we ping the VMs? We are still on the Compute node:

```console
#> ping 203.0.113.26
PING 203.0.113.26 (203.0.113.26) 56(84) bytes of data.
64 bytes from 203.0.113.26: icmp_seq=1 ttl=64 time=0.859 ms
...
```

Seems so! Let's have a look at the routing tables:

```console
#> route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.162.128.1    0.0.0.0         UG    0      0        0 br100
10.162.128.0    0.0.0.0         255.255.255.0   U     0      0        0 br100
10.162.130.0    0.0.0.0         255.255.255.0   U     0      0        0 ib0
169.254.0.0     0.0.0.0         255.255.0.0     U     1004   0        0 ib0
192.168.122.0   0.0.0.0         255.255.255.0   U     0      0        0 virbr0
203.0.113.24    0.0.0.0         255.255.255.248 U     0      0        0 br100
```

The last entry is the interesting one.

What about **isolation**?

```console
#> ebtables -L
Bridge table: filter

Bridge chain: INPUT, entries: 1, policy: ACCEPT
-p ARP -i em1 --arp-ip-dst 203.0.113.25 -j DROP

Bridge chain: FORWARD, entries: 0, policy: ACCEPT

Bridge chain: OUTPUT, entries: 1, policy: ACCEPT
-p ARP -o em1 --arp-ip-src 203.0.113.25 -j DROP
```

Seems quite right and clean.

Now log in to the virtual machine via a noVNC console. On the normal
user's console, obtain a token:

```console
$> nova get-vnc-console demo-inst2 novnc
+-------+------------------------------------------------------------------------------------+
| Type  | Url                                                                                |
+-------+------------------------------------------------------------------------------------+
| novnc | http://cn43.internal:6080/vnc_auto.html?token=0ec8dfda-6f16-4a02-ade7-0a381dd49c09 |
+-------+------------------------------------------------------------------------------------+
```

Use the URL in a browser (with appropriate tunnels!) to access the
VM's console.

We have launched a CirrOS image which has a user and password by
default (indicated on-screen). We notice from inside the VM that it
obtained the IP address correctly via DHCP. We also notice that we can
communicate between VMs, and with the hypervisor.

> Every hypervisor will have the **same** IP address associated as
> gateway, *i.e.* **203.0.113.25** in our case, but *ebtables*
> prevents any mess from happening. So, every VM, wherever it is, will
> see its own hypervisor as gateway, with the same IP address on the
> whole cluster, also allowing for migration.


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


Recipes
-------

### Kill Switch

To remove one node from the Compute service, do as **root** on that
node:

```bash
service openstack-nova-compute stop
service openstack-nova-network stop
service openstack-nova-metadata-api stop
```


Questions
---------

* DHCP: configure address class for the VMs
* Install spare disks for LVM block storage
* We can't have multiple IP addresses on the same interface, if the
  main one is DHCP: whenever a renewal occurs, all other IP addresses
  are removed instantly


Resources
---------

* [OpenStack Icehouse with RPMs](http://docs.openstack.org/icehouse/install-guide/install/yum/content/)
* [OpenStack releases](https://wiki.openstack.org/wiki/Releases)
* [Install OpenStack Icehouse from CERN IT](http://information-technology.web.cern.ch/book/cern-cloud-infrastructure-user-guide/advanced-topics/installing-openstack#icehouse)
* [OpenStack Operations Guide](http://docs.openstack.org/ops/)
