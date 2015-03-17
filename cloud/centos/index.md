---
title: "CentOS 6 Cloud Image"
layout: tweet

createtoc: true
parnumbers: true
---


Download
--------

Latest image is **CentOS 6.5 (custom build v8) - Mar 17, 2015**:

* [Download image](http://personalpages.to.infn.it/~berzano/cloud-images/CentOS65-x86_64-build8-compat0.10.qcow2) (~1.1 GB)
* [GPG signature](http://personalpages.to.infn.it/~berzano/cloud-images/CentOS65-x86_64-build8-compat0.10.qcow2.sig)


### Features

* Minimal **[CentOS](http://www.centos.org/) 6 x86_64** installation
* **qcow2** format, v0.10
* **Single root partition** (no swap) that **automatically grows** to
  the full backing block device where applicable (*e.g.* virtual
  machines on LVM logical volumes)
* **[cloud-init](http://cloudinit.readthedocs.org/) v0.7.5**
  (configured with support for EC2 metadata server, packages
  installation, Yum repository addition, mount points manipulation)
* **[CernVM-FS](http://cernvm.cern.ch/portal/startcvmfs) v2.1.20**
  (unconfigured and disabled by default)
* **[HTCondor](http://research.cs.wisc.edu/htcondor/) v8.2.7**
  (unconfigured and disabled by default)
* **[EPEL](https://fedoraproject.org/wiki/EPEL/) 6.8**
* **SELinux enabled** (it can be disabled at context time)

> **Caveat!** Image comes with a default root password *(pippo123)*: it
> can be disabled during contextualization as explained
> [below](#disable_root_login).


### Verify image

To verify the GPG signature, you need to trust the following key:

* [My GPG key](http://pgp.mit.edu:11371/pks/lookup?op=get&search=0xBFF76234)

Image and signature must be in the same directory. Run from a
terminal:

```console
$> gpg --verify <FileName>.qcow2.sig
gpg: Signature made <FullDateHere> using DSA key ID BFF76234
gpg: Good signature from "Dario Berzano <FullEmailHere>"
```

**OS X users:** if you have [GPG Tools](https://gpgtools.org/) simply
double-click the signature file from the Finder to verify it.

> Do not use the image if signature verification fails!


Contextualize the image
-----------------------

This image supports **[cloud-init](http://cloudinit.readthedocs.org/)
v0.7.4**: check **/etc/cloud/cloud.cfg** to see in more detail what
modules and datasources are enabled by default.

In the following sections, sample cloud-init contextualizations are
provided: they are text files that should be provided as
[user-data](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html).


### Disable root login

Account for user **root** is enabled by default with a very weak
password: a minimal cloud-init configuration file that only disables
the root account is provided.

```yaml
#cloud-config

users:
 - default

bootcmd:
 - passwd --lock root
```

With this configuration:

* SSH login will be possible as user **cloud-user** with the SSH key
  provided via the cloud interface
* User **cloud-user** can escalate to root without password via `sudo`
* The **root** user will not be able to login with a password: the
  only way to become root is via the **cloud-user**


### Create swap space

This image comes without a swap partition. If running it backed by a
block device, or you have converted it from qcow2 to raw, we can
create a big file on the root filesystem to use as swap.

Note that using files for swap
[is as efficient as using partitions](http://serverfault.com/questions/25653/swap-partition-vs-file-for-performance),
as long as:

* files are not sparse
* the backing VM image is not qcow2

With that in mind, we can use the following cloud-init user-data for
instance when instantiating the VM backed by LVM logical volumes.

```yaml
#cloud-config

bootcmd:
 - |
    SWAP_PER_CORE_KB=3000000
    SWAP_FILE=/swap
    SWAP_SIZE_KB=$(( $(grep -c bogomips /proc/cpuinfo) * SWAP_PER_CORE_KB ))
    if [[ ! -e "$SWAP_FILE" ]] ; then
      fallocate -l ${SWAP_SIZE_KB}000 "$SWAP_FILE"
      mkswap "$SWAP_FILE"
    fi

mounts:
 - [ /swap, swap, swap, sw ]
```

This script uses `fallocate` to quickly create a large file, and we
can decide the number of KB of swap space per virtual core (it is
**3 GB per core** in the above example).


### Upgrading and installing packages (example: CVMFS)

cloud-init can perform a `yum upgrade` during the first boot, and it
can install extra packages as well.

The following example will:

* add a new repository for CVMFS
* install CVMFS and [htop](http://hisham.hm/htop/)
* upgrade all packages on the system
* configure CVMFS

```yaml
#cloud-config

yum_repos:
  cvmfs:
    name: CernVM-FS Stable
    baseurl: http://cvmrepo.web.cern.ch/cvmrepo/yum/cvmfs/EL/$releasever/$basearch
    enabled: true
    gpgcheck: false

package_upgrade: true

packages:
 - cvmfs
 - htop

runcmd:
 - echo CVMFS_HTTP_PROXY="http://<my_http_proxy>:3128" > /etc/cvmfs/default.local
 - [ cvmfs_config, setup ]
 - [ cvmfs_config, reload ]
 - [ service, autofs, forcerestart ]
 - [ chkconfig, autofs, on ]
```

**Note:** the `bootcmd:` section executes commands very early in the
contextualization process (before any other module), while the
`runcmd:` section executes them after everything else.


### A HTCondor worker node for ALICE jobs

This long example uses the base image to configure a HTCondor worker
node for running ALICE Grid jobs. The node attaches it to an existing
HTCondor head node by using a shared secret as authentication.

This context is currently used in production on the ALICE HLT Cloud:
obviously addresses and passwords are not the real ones.

Features:

* Creates a user **aliprod** and group **aliprod**, both with ID 355:
  user's home is `/var/lib/aliprod`.
* root password is disabled
* No package upgrade or installation for faster boot
* Swap disk with 3 GB per core
* HTCondor is configured to work without valid FQDNs (only IP
  addresses)
* Job wrapper script setting a very minimal environment for ALICE jobs
* SELinux turned off
* Possibility to define the amount of RAM memory per core: as VM
  flavours cannot be customized (and they usually come with 2 GB per
  core), HTCondor is configured to start a lower number of job slots
  in order to give each at least the configured amount of memory
  (look for `MEM_PER_CORE_KB`)

```yaml
#cloud-config

users:
 - default

package_upgrade: false

bootcmd:
 - |
    getent group | grep -Eq ^aliprod: || groupadd aliprod -g 355
    id aliprod > /dev/null 2>&1 || useradd aliprod -u 355 -g 355 -m --home-dir /var/lib/aliprod
 - passwd --lock root
 - |
    SWAP_PER_CORE_KB=3000000
    SWAP_FILE=/swap
    SWAP_SIZE_KB=$(( $(grep -c bogomips /proc/cpuinfo) * SWAP_PER_CORE_KB ))
    if [[ ! -e "$SWAP_FILE" ]] ; then
      fallocate -l ${SWAP_SIZE_KB}000 "$SWAP_FILE"
      mkswap "$SWAP_FILE"
    fi

mounts:
 - [ /swap, swap, swap, sw ]

write_files:
 - content: |
     # written by cloud-init
     DAEMON_LIST = MASTER, STARTD
     CONDOR_HOST = <IP_FOR_HTCONDOR_HEAD>
     CONDOR_ADMIN = root@<IP_FOR_HTCONDOR_HEAD>
     UID_DOMAIN = *
     TRUST_UID_DOMAIN = True
     SOFT_UID_DOMAIN = True
     QUEUE_SUPER_USERS = root, condor
     HIGHPORT = 42000
     LOWPORT = 41000
     SEC_DAEMON_AUTHENTICATION = required
     SEC_DAEMON_INTEGRITY = required
     SEC_DAEMON_AUTHENTICATION_METHODS = password
     SEC_CLIENT_AUTHENTICATION_METHODS = password,fs,gsi,kerberos
     SEC_PASSWORD_FILE = /etc/condor/condor_credential
     SEC_ENABLE_MATCH_PASSWORD_AUTHENTICATION = True
     ALLOW_DAEMON = condor_pool@*, submit-side@matchsession
     COLLECTOR_NAME = Condor cluster at \$(CONDOR_HOST)
     NEGOTIATOR_INTERVAL = 20
     START = TRUE
     SUSPEND = FALSE
     PREEMPT = FALSE
     KILL = FALSE
     TRUST_UID_DOMAIN = TRUE
     UPDATE_COLLECTOR_WITH_TCP = True
     COLLECTOR_SOCKET_CACHE_SIZE = 1000
     # this is needed to set the path
     USER_JOB_WRAPPER = /etc/condor/job_wrapper.sh
     # this is a dummy value to prevent job killing for consuming too much mem
     JOB_DEFAULT_REQUESTMEMORY = 42
   path: /etc/condor/condor_config.local
   permissions: '0644'
   owner: root:root
 - content: |
     #!/bin/sh
     echo '^___^ <--( welcome to condor! )'
     export PATH='/bin:/usr/bin'
     export USER=`whoami`
     if [[ "$USER" == 'aliprod' ]] ; then
       export HOME='/var/lib/aliprod'
     elif [[ "$UID" != '' ]] ; then
       export HOME="/tmp/home-$UID"
     fi
     exec "$@"
   path: /etc/condor/job_wrapper.sh
   permissions: '0755'
   owner: root:root

runcmd:
 - |
    # set the fqdn to something known by the vobox (needed by AliEn/MonALISA)
    IP_ADDRESS=$( ifconfig eth0 | grep 'inet addr:' | sed -e 's/\s*inet addr:// ; s/\s.*$//' )
    if [[ "$IP_ADDRESS" != '' ]] ; then
      XY=$( echo "$IP_ADDRESS" | sed -e 's/^\([0-9]\+\.\)\{2\}//' )
      X=$( echo "$XY" | cut -d. -f1 )
      Y=$( echo "$XY" | cut -d. -f2 )
      GEN_HOSTSHORT=$( printf "wn-%03d-%03d" $X $Y )
      GEN_HOSTFQDN=$( printf "wn-%03d-%03d.hltcloud" $X $Y )

      # /etc/hosts
      F=/etc/hosts
      cat "$F" | grep -v "$IP_ADDRESS" > "$F".0
      [[ $( tail -n1 "$F".0 | wc --lines ) == '0' ]] && echo '' >> "$F".0
      echo "$IP_ADDRESS $GEN_HOSTFQDN $GEN_HOSTSHORT" >> "$F".0
      mv "$F".0 "$F"

      # system configuration
      F=/etc/sysconfig/network
      cat "$F" | grep -v "HOSTNAME=" > "$F".0
      [[ $( tail -n1 "$F".0 | wc --lines ) == '0' ]] && echo '' >> "$F".0
      echo "HOSTNAME=$GEN_HOSTFQDN" >> "$F".0
      mv "$F".0 "$F"

      # make changes
      hostname "$GEN_HOSTFQDN"
      service network restart
    fi
 - echo 0 > /selinux/enforce
 - echo CVMFS_HTTP_PROXY="http://<MY_HTTP_PROXY>:3128" > /etc/cvmfs/default.local
 - [ cvmfs_config, setup ]
 - [ cvmfs_config, reload ]
 - [ service, autofs, forcerestart ]
 - [ service, condor, stop ]
 - [ rm, -rf, /etc/condor/config.d ]
 - |
    # variables
    CFG=/etc/condor/condor_config
    CFG_LOCAL="$CFG".local
    IP_ADDRESS=$( ifconfig eth0 | grep 'inet addr:' | sed -e 's/\s*inet addr:// ; s/\s.*$//' )
    TOT_MEM_KB=$(cat /proc/meminfo | grep MemTotal | awk '{ print $2 }')
    NUM_PHYS_CORES=$(grep -c bogomips /proc/cpuinfo)
    MEM_PER_CORE_KB=2700000
    NUM_SLOTS=$(( TOT_MEM_KB/MEM_PER_CORE_KB ))
    [[ $NUM_SLOTS -gt $NUM_PHYS_CORES ]] && NUM_SLOTS=$NUM_PHYS_CORES

    # prepare config: strip old vars, add new line at the end
    cat "$CFG" | grep -vE '^\s*NO_DNS\s*=|^\s*DEFAULT_DOMAIN_NAME\s*=|^\s*NETWORK_INTERFACE\s*=' > "$CFG".0
    [[ $( tail -n1 "$CFG".0 | wc --lines ) == '0' ]] && echo '' >> "$CFG".0

    # append cfg vars (they need to stay here)
    cat >> "$CFG".0 <<EOF
    NETWORK_INTERFACE = $IP_ADDRESS
    NO_DNS = True
    DEFAULT_DOMAIN_NAME = condor-net
    EOF
    mv "$CFG".0 "$CFG"

    # number of cores: adapt if we cannot tune the vm flavors
    echo "NUM_CPUS=$NUM_SLOTS" >> "$CFG_LOCAL"
 - [ rm, -f, /etc/condor/condor_credential ]
 - [ condor_store_cred, add, -c, -p, <CONDOR_SHARED_SECRET> ]
 - [ chkconfig, condor, on ]
 - [ chkconfig, autofs, on ]
 - [ service, condor, start ]
```

The following parameters have been stripped out and must be replaced
with something sensible:

* `<IP_FOR_CONDOR_HEAD>`: set it to the IP address of your HTCondor
  head node
* `<MY_HTTP_PROXY>`: set it to the address of your HTTP proxy (also
  check the port)
* `<CONDOR_SHARED_SECRET>`: set it to the cleartext version of your
  HTCondor shared secret, which must obviously be the same as your
  HTCondor head node

> This context was created for a specific use case, so do not expect
> it to work for you if you blindly copy-paste it!


How the image was created
-------------------------

Image has been created on OS X using VMWare Fusion, but these
instructions can be adapted to whatever hosting operating system and
whatever hypervisor you use.

If you do not trust the ready-to-go cloud image, or you are simply
curious, you can go through the instructions yourself.


### Virtual machine creation

With VMWare Fusion, we create a new Virtual Machine with:

* a single disk, 20 GB, not preallocated
* networking with NAT on a single network interface
* audio, bluetooth, printers sharing disabled

Through the Wizard we install CentOS via the "netinstall" image:

* [Direct download of netinstall iso for CentOS 6.5](http://linuxsoft.cern.ch/centos/6.5/isos/x86_64/CentOS-6.5-x86_64-netinstall.iso)

Other CentOS install images are available
[here](http://linuxsoft.cern.ch/centos/6.5/isos/x86_64/).


### Installation

As soon as you boot the iso, the following screen will appear: proceed
to the installation:

![CentOS netinst boot](centos-inst-boot.png)

When prompted, select the software source to:

```
http://linuxsoft.cern.ch/centos/6/os/x86_64
```

![CentOS netinst source](centos-inst-src.png)

**Use the default installation options as much as possible.**

Change only the following things:

* use Etc/UTC as timezone
* turn off IPv6 (unless you need it)
* set "pippo123" as dummy root password


#### Disk layouts

Do not use LVM and do not create any swap partition. Create a single
partition with the **ext4** filesystem mounted as the root partition,
and tell CentOS to fill partition to the maximum allowable size:

![CentOS netinst disks](centos-inst-disk.png)


#### Packages customization

Do not install any specific package, just the "minimal" set: when you
have finished, non-interactive installation begins.

At the end of the installation the VM reboots.

> With VMWare the VM may appear stuck after rebooting. This is a known
> bug: **pause and unpause** the VM to unfreeze the screen.


### Image customization

After booting the image we can customize it.


#### Network interface

Remove any reference of MAC addresses from the network configuration,
enable DHCP, disable NetworkManager and make the DHCP client retry
forever if no address is assigned. Do all of this by running:

```bash
cat > /etc/sysconfig/network-scripts/ifcfg-eth0 <<\EoF
TYPE=Ethernet
DEVICE=eth0
ONBOOT=yes
BOOTPROTO=dhcp
NM_CONTROLLED=no
PERSISTENT_DHCLIENT=1
EoF
```

To avoid problems with EC2 metadata servers, add the following line
to **/etc/sysconfig/network**:

```bash
NOZERCONF=yes
```

Restart networking to test:

```bash
service network restart
```


#### Install extra repositories

[EPEL](https://fedoraproject.org/wiki/EPEL/): get the latest RPM from
[here](http://mirror.switch.ch/ftp/mirror/epel/6/i386/repoview/epel-release.html)
and install it to enable the repository.

For instance, for EPEL version 6.8:

```bash
yum install -y http://mirror.switch.ch/ftp/mirror/epel/6/i386/epel-release-6-8.noarch.rpm
```

Also install extra repositories for
[HTCondor](http://research.cs.wisc.edu/htcondor/) and
[CernVM-FS](http://cernvm.cern.ch/portal/startcvmfs).

For HTCondor create **/etc/yum.repos.d/htcondor.repo**:

```ini
[htcondor]
name=HTCondor Stable RPM Repository for Redhat Enterprise Linux 6
baseurl=http://research.cs.wisc.edu/htcondor/yum/stable/rhel$releasever
enabled=1
gpgcheck=0
```

For CernVM-FS create **/etc/yum.repos.d/cvmfs.repo**:

```ini
[cvmfs]
name=CernVM-FS Stable
baseurl=http://cvmrepo.web.cern.ch/cvmrepo/yum/cvmfs/EL/$releasever/$basearch
enabled=1
gpgcheck=0
```

> We are using the "stable" repositories for both HTCondor and CernVM-FS by
> default

If you want to use CernVM-FS Testing instead, this is the manifest:

```ini
[cvmfs]
name=CernVM-FS Testing
baseurl=http://cvmrepo.web.cern.ch/cvmrepo/yum/cvmfs-testing/EL/$releasever/$basearch
enabled=1
gpgcheck=0
```

Extra WLCG packages are available from an additional repository. There is a RPM
that performs the repository creation:

```bash
yum install -y http://linuxsoft.cern.ch/wlcg/sl6/x86_64/wlcg-repo-1.0.0-1.el6.noarch.rpm
```

The package is from [this directory](http://linuxsoft.cern.ch/wlcg/sl6/x86_64/).


#### Upgrade your system

**Before you install any extra package**, immediately upgrade the
system:

```bash
yum -y distro-sync
yum -y upgrade
```

Reboot when finished (not needed if kernel did not change):

```bash
reboot
```

#### Extra packages

Install some base extra packages:

```bash
yum install -y cloud-utils cloud-init parted git vim-enhanced
```

Install the following packages required by ALICE (*i.e.* without them,
ALICE software will **not** run): this is the
[minimal list](http://alien2.cern.ch/index.php?option=com_content&view=article&id=134:cvmfs&catid=7&Itemid=140):

```bash
yum install gcc gcc-c++ gcc-gfortran libXpm compat-libgfortran-41 redhat-lsb-core tcl compat-libtermcap
```

If you want to play safe, install a WLCG metapackage with all required stuff for
all LHC experiments. This comes from the WLCG repo we've configured earlier:

```bash
yum install -y HEP_OSlibs_SL6
```

This is a superset of the minimal list provided above. The CentOS image ready to
download has such metapackage, and all related packages, installed.

> **Beware:** this metapackage **increases the image size of ~50%!**

Install HTCondor and CernVM-FS:

```bash
yum install -y condor cvmfs
```

Disable them (we can enable them if we need them during
contextualization):

```
chkconfig condor off
chkconfig autofs off
```

**Note:** we disable autofs to disable CernVM-FS automounting.

Check if they are disabled:

```console
$> chkconfig | grep -E 'condor|autofs'
autofs              0:off     1:off     2:off     3:off     4:off     5:off     6:off
condor              0:off     1:off     2:off     3:off     4:off     5:off     6:off
```

#### Automatically growing root partition

If running the virtual machine from a virtual disk stored on a block
device and not on a file (such as a LVM logical volume), we want the
virtual disk to grow up to the maximum disk space.

Although several modules for resizing partitions exist for cloud-init,
the only way to resize the root partition without rebooting is by
doing it before the root filesystem is mounted, *i.e.* from the
"initial ramdisk".

[Smart people](https://github.com/flegmatik/)
have written
[the machinery to do that](https://github.com/flegmatik/linux-rootfs-resize.git).

Here is how we enable our initrd to grow:

```bash
cd /tmp
git clone https://github.com/flegmatik/linux-rootfs-resize.git
cd linux-rootfs-resize
./install
```

**Note:** we are downloading the HEAD of the Git master by default. In
case of problems, the latest tested hash that has proven to
work with our custom virtual machine is
[08f06bf5d9](https://github.com/flegmatik/linux-rootfs-resize/tree/08f06bf5d90bba5d655bf860786b5b58a790ef07).


#### cloud-init configuration

Let's edit **/etc/cloud/cloud.cfg** and make sure the following
modules, datasources, etc. are present (just **add** them to the
relevant sections, **do not** replace the file with this one):

```yaml
disable_root: 1
ssh_pwauth:   0

datasource_list: [ 'Ec2', 'OpenNebula' ]

datasource:
  # case-sensitive!
  Ec2:
    max_wait: 20
    timeout: 20

cloud_config_modules:
 - mounts
 - yum_add_repo
 - package_update_upgrade_install

system_info:
  default_user:
    sudo: ALL=(ALL) NOPASSWD:ALL
```

We have enabled modules for mounting filesystems, adding repositories
and installing/upgrading packages.

In addition, the default user "cloud-user" will have `sudo` permissions without
password.


#### Clean up before shutting down

Inspired from [here](http://libguestfs.org/virt-sysprep.1.html#operations).

```bash
rm -rf /var/spool/abrt/*
unset HISTFILE

rm -f /root/.bash_history /home/*/.bash_history
rm -f /var/lib/dhclient/*
rm -f /etc/sysconfig/iptables
service iptables restart
yum clean all
rm -rf /var/cache/yum/*
rm -rf /root/.ssh/ /home/*/.ssh/

echo -n '' > /etc/udev/rules.d/75-persistent-net-generator.rules
echo -n '' > /etc/udev/rules.d/70-persistent-net.rules

rm -f /etc/ssh/ssh_*_key
rm -rf /var/lib/cloud
rm -rf /tmp/*
userdel -frZ cloud-user

rm -rf \
  /etc/Pegasus/*.cnf \
  /etc/Pegasus/*.crt \
  /etc/Pegasus/*.csr \
  /etc/Pegasus/*.pem \
  /etc/Pegasus/*.srl \
  /root/anaconda-ks.cfg \
  /root/anaconda-post.log \
  /root/initial-setup-ks.cfg \
  /root/install.log \
  /root/install.log.syslog \
  /var/cache/fontconfig/* \
  /var/cache/gdm/* \
  /var/cache/man/* \
  /var/lib/AccountService/users/* \
  /var/lib/fprint/* \
  /var/lib/logrotate.status \
  /var/log/*.log* \
  /var/log/BackupPC/LOG \
  /var/log/ConsoleKit/* \
  /var/log/anaconda.syslog \
  /var/log/anaconda/* \
  /var/log/apache2/*_log \
  /var/log/apache2/*_log-* \
  /var/log/apt/* \
  /var/log/aptitude* \
  /var/log/audit/* \
  /var/log/btmp* \
  /var/log/ceph/*.log \
  /var/log/chrony/*.log \
  /var/log/cron* \
  /var/log/cups/*_log \
  /var/log/debug* \
  /var/log/dmesg* \
  /var/log/exim4/* \
  /var/log/faillog* \
  /var/log/gdm/* \
  /var/log/glusterfs/*glusterd.vol.log \
  /var/log/glusterfs/glusterfs.log \
  /var/log/httpd/*log \
  /var/log/installer/* \
  /var/log/jetty/jetty-console.log \
  /var/log/journal/* \
  /var/log/lastlog* \
  /var/log/libvirt/libvirtd.log \
  /var/log/libvirt/lxc/*.log \
  /var/log/libvirt/qemu/*.log \
  /var/log/libvirt/uml/*.log \
  /var/log/lightdm/* \
  /var/log/mail/* \
  /var/log/maillog* \
  /var/log/messages* \
  /var/log/ntp \
  /var/log/ntpstats/* \
  /var/log/ppp/connect-errors \
  /var/log/rhsm/* \
  /var/log/sa/* \
  /var/log/secure* \
  /var/log/setroubleshoot/*.log \
  /var/log/spooler* \
  /var/log/squid/*.log \
  /var/log/syslog* \
  /var/log/tallylog* \
  /var/log/tuned/tuned.log \
  /var/log/wtmp* \
  /var/named/data/named.run \
  /var/log/cloud-init.log
```

**Note:** it is recommended to create under the root user a script
with the above content, to re-run every time you upgrade the image.

At this point you can shut down:

```bash
halt
```

> If you boot the image by accident, you have to **clean it up again**
> before saving it!


### Converting the image to qcow2

Take a VMWare snapshot just in case: we will restart from there in
case of problems.

VMWare saves everything under *bundles*, seen as normal directories
if using a terminal:

```bash
cd '/Users/myuser/Virtual Machines/CentOS, 64 bit.vmwarevm'
```

Disks have extension `.vmdk`. Every disk is split in several files:
moreover, a set of split files exists per snapshot.

So, for instance:

```
$> ls -l *.vmdk
Disk-000001-s001.vmdk
Disk-000001-s002.vmdk
Disk-000001-s003.vmdk
Disk-000001-s004.vmdk
Disk-000001-s005.vmdk
Disk-000001-s006.vmdk
Disk-000001-s007.vmdk
Disk-000001-s008.vmdk
Disk-000001-s009.vmdk
Disk-000001-s010.vmdk
Disk-000001-s011.vmdk
Disk-000001.vmdk
Disk-000002-s001.vmdk
Disk-000002-s002.vmdk
Disk-000002-s003.vmdk
Disk-000002-s004.vmdk
Disk-000002-s005.vmdk
Disk-000002-s006.vmdk
Disk-000002-s007.vmdk
Disk-000002-s008.vmdk
Disk-000002-s009.vmdk
Disk-000002-s010.vmdk
Disk-000002-s011.vmdk
Disk-000002.vmdk
Disk-s001.vmdk
Disk-s002.vmdk
Disk-s003.vmdk
Disk-s004.vmdk
Disk-s005.vmdk
Disk-s006.vmdk
Disk-s007.vmdk
Disk-s008.vmdk
Disk-s009.vmdk
Disk-s010.vmdk
Disk-s011.vmdk
Disk.vmdk
```

means that we have three disk sets:

* `Disk.vmdk` (and `Disk-s??.vmdk`) is the current working copy
* `Disk-000001.vmdk` (and `Disk-000001-s??.vmdk`) is the oldest
  snapshot
* `Disk-000002.vmdk` (and `Disk-000002-s??.vmdk`) is the most recent
  snapshot

Since we have just taken a snapshot, we are interested in converting
the following disk: `Disk-000002.vmdk`.

We must have `qemu-img` installed on OS X. To install it (with
[Homebrew](http://brew.sh/)):

```bash
brew install qemu
```

To convert:

```bash
qemu-img convert \
  -O qcow2 \
  -c \
  -o compat=0.10 \
  'Disk-000002.vmdk' \
  CentOS65-x86_64-build<N>-compat0.10.qcow2
```

To sign with GPG:

```bash
gpg --detach-sign CentOS65-x86_64-build<N>-compat0.10.qcow2
```

A binary file named `CentOS65-x86_64-build<N>-compat0.10.qcow2.sig`
will be created and must be distributed along with the image.

Notes:

* We use **qcow2 v0.10** (instead of the latest) for **compatibility**
  with the qemu version running on CentOS 6 hypervisors: you might not
  need it.
* The `-c` option makes smaller images ("compress").
* Our convention is incrementing the build number `<N>` by 1 every
  time we release a new image version.


### Upgrading an existing image

Boot the existing image from VMWare: since we have created snapshots
we can always revert if something went wrong.

Log in and repeat the [upgrade procedure](#upgrade_your_system).

If kernel version changed, reboot the VM, log in again and
[reinstall support for growing root partition](#automatically_growing_root_partition).

Then [clean everything up](#clean_up_before_shutting_down) and halt:
the upgraded image is ready to be converted and distributed.
