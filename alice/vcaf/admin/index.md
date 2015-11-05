---
title: "Virtual CERN Analysis Facility for administrators"
layout: tweet

parnumbers: true
createtoc: true
---


Who can control it
------------------

The Virutal CERN Analysis Facility runs on top of
[CERN OpenStack](https://openstack.cern.ch/).

ALICE has a special OpenStack project for VCAF virtual machines called **ALICE
CERN Analysis Facility**. All persons belonging to the CERN egroup **alice-vaf**
can launch, terminate and control virtual machines on this OpenStack project.

Only persons belonging to the egroup **alice-agile-admin** can add and remove
members from the **alice-vaf** egroup.


Architecture overview
---------------------

The Virtual CAF is a [HTCondor](http://research.cs.wisc.edu/htcondor/) batch
cluster. Even though any batch job can be run on top of it, the Virtual CAF is
intended to run PROOF via [PROOF on Demand (PoD)](http://pod.gsi.de/).

Thanks to [a set of environment
scripts](https://github.com/dberzano/virtual-analysis-facility) the batch system
is invisible to the end user.


### Virtual machines and contextualization

The Virtual CAF is a cluster made of several virtual machines, sharing a single
base image. The base image is [CernVM](http://cernvm.cern.ch/) and the
contextualization uses
[cloud-init](https://cloudinit.readthedocs.org/en/latest/). This specific
Virtual CAF configuration is made to work from the CERN network and with the
virtual machines having a CERN registered IP address.

A vanilla implementation of the VAF featuring automatic scalability, that works
on any cloud even outside CERN, can be graphically configured online using the
[CernVM Online](https://cernvm-online.cern.ch/) portal by following the
instructions [here](http://cernvm.cern.ch/portal/elasticclusters).

The single base image is *contextualized* via cloud-config manifests interpreted
at boot time by cloud-init.


### Node classes

There are three classes of nodes: as said the virtual base image is the same,
but the contextualization changes.

* **Head node:** a single node running the HTCondor Collector and Negotiator. No
  job submission is possible from this node. This node also contains the
  [elastiq](https://github.com/dberzano/elastiq) daemon taking care of the
  deployment of virtual worker nodes. There is only one of this kind and its
  name is **alivaf-000.cern.ch**.
* **Submit nodes:** several nodes running the HTCondor Schedd. Those are login
  nodes, and users will login there and submit PROOF jobs from there. There are
  several nodes of this kind for scalability reasons as they will run PROOF
  masters. Their names are in the form **alivaf-[NUM].cern.ch**.
* **Execute nodes:** users cannot login there. Those nodes merely execute
  submitted jobs. Their names are automatically assigned by OpenStack: since
  they are launched via the EC2 API it is not possible to pick a name.


How to launch a new cluster
---------------------------

As system administrator you will have to perform the following steps:

1. Launch the single **head node**
2. Launch the number of **submit nodes** you wish
3. Configure the head node to control workers deployment automatically

Points 1. and 2. are performed from the
[CERN OpenStack](https://openstack.cern.ch/) web interface, under the
**ALICE CERN Analysis Facility** project.


### Registering the key

When launching a new node, you might notice that the **AliceVCAF** key is not
available in your list of keys. This is because OpenStack SSH keys are per user
and not per project.

In practice you need to register the same key with the same name under your user
for convenience.

The public key can be found here:

```
/afs/cern.ch/alice/offline/vaf/private/AliceVCAF.pub
```

Go on the CERN OpenStack web interface, go to **Access & Security**, then
**Import Key Pair**.

Use **AliceVCAF** as the key name (do not use an arbitrary name!) and paste the
given public key in the textbox.

The corresponding private key, readable from AFS only by the admins, is:

```
/afs/cern.ch/alice/offline/vaf/private/AliceVCAF.pem
```


### Starting the head node

Click on the **Launch Instance** button, then:

* Instance Name: **alivaf-000** (do not use any other name!)
* Flavor: **m1.medium** (we do not need a larger VM for this purpose)
* Instance Boot Source: **Boot from image**
* Image Name: **CentOS6-buildXXX** (substitute XXX with the most recent number)

On the **Access & Security** tab you must pick the **AliceVCAF** keypair.

On the **Post-Creation** tab, provide the contextualization file
`cern-vaf-head.txt` from the private area. This file is not public as it
contains sensitive information.

That is it, you can click the **Launch** button and wait.


### Starting multiple submit nodes

Click on the **Launch Instance** button, then:

* Instance Name: **alivaf-000** (do not use any other name!)
* Flavor: **m1.large** (we do not need a larger VM for this purpose)
* Instance Boot Source: **Boot from image**
* Image Name: **CentOS6-buildXXX** (substitute XXX with the most recent number)

On the **Access & Security** tab you must pick the **AliceVCAF** keypair.

On the **Post-Creation** tab, provide the contextualization file
`cern-vaf-submit.txt` from the private area. This file is not public as i
contains sensitive information.

That is it, you can click the **Launch** button and wait.


### Managing worker nodes

Worker nodes are launched by the [elastiq](https://github.com/dberzano/elastiq)
daemon, which is turned off and unconfigured by default.

The configuration file is available from the private area and it is called
`elastiq.conf`.

This file contains in particular a base64 one-line long string which contains
the contextualization to use for the worker nodes.

In principle elastiq can be configured to automatically turn on and off nodes
based on the effective use of the cluster: since VM deployment appears to be
slow on CERN OpenStack we are configuring it with an identical minimum and a
maximum quota to always keep the same number of VMs alive whatever the effective
use is.

Once configured, elastiq should be (re)started:

```bash
service elastiq restart
```

It is convenient to use elastiq as it automatically detects VMs in error and
tries to recover.

Once elastiq is up and running, it is possible to, for instance, periodically
refresh or update a stuck cluster by simply deleting from the OpenStack
interface all the VMs whose name starts with **server-**: elastiq will detect
the missing VMs and will respawn them automatically.


Logging in to the virtual machines
----------------------------------

Virtual machines are configured to allow unprivileged logins from all CERN users
from the **alice-member** egroup using their CERN password with Kerberos
authentication. An AFS token is also automatically created at login.

In addition, non-ALICE users can be granted VAF access if they are members of
**alice-vaf-external-users**.

For administering the machine you need to have the private key corresponding to
the **AliceVCAF** key you have used when starting the virtual machines from
OpenStack.

You cannot login as root; instead, you will log in as user **cloud-user**:

```bash
ssh cloud-user@alivaf-000.cern.ch -i ~/.ssh/AliceVCAF.pem
```

This user has passwordless sudo privileges. To become root:

```bash
sudo -sE
```


Configuration on AFS
--------------------

Most of the configuration is read directly from AFS. Everything is stored under:

```
/afs/cern.ch/alice/offline/vaf
```

### The AliceVaf.par file

This file is a special PARfile required to load the ALICE environment. It is
stored in the aforementioned directory, and users load it directly from there.

The file is generated following the procedure from
[here](https://github.com/dberzano/cern-alice-setup/tree/master/aaf_packages).

Replacing this package means updating it for all users.


### User quotas

The **condor** directory contains a file with all the necessary information to
enforce user quotas on the cluster.

There are three variables to configure (do not touch the rest!):

* `POWER_USERS`: a comma-separated list of users with "more" quota. Use CERN
  usernames here.
* `MAX_RUNNING_JOBS_PER_NORMAL_USER`: quota for users *not* in the list of power
  users. During special occasions it might be possible to set this to zero, and
  to allow only one power user to utilize the full cluster, for instance.
* `MAX_RUNNING_JOBS_PER_POWER_USER`: quota for the power users.

Change this file directly on AFS. After changing it, Condor needs to be
reloaded on the head node and all submit nodes! Note that it is sufficient to
*reload* it and it is not needed to perform a costly *restart* operation:

```bash
service condor reload
```


### ALICE environment

The **etc** directory contains scripts read by `vaf-enter` when setting the
user environment. Changing the files from AFS affects all VAF users immediately,
no need to restart any service (they will have to re-enter the VAF environment
though).

See [here](https://github.com/dberzano/virtual-analysis-facility) for more
information.


### Private configuration

The **private** directory is not readable by users. It contains:

* The three contextualization files for the three classes of nodes
* The configuration file for elastiq
* Public and private key for accessing the VMs as administrator
* A file to source in order to have EC2 credentials in the environment


### Make the private directory "private"!

Since we are on AFS, `chmod 0700` will not be sufficient! From a privileged user
(**alibrary** is the service account owning the files):

```bash
cd /afs/cern.ch/alice/offline/vaf/private
fs setacl -dir $PWD -acl system:anyuser none
fs setacl -dir $PWD -acl dberzano write
fs setacl -dir $PWD -acl litmaath write
```

AFS permissions are explained
[here](https://www.cs.cmu.edu/~help/afs/afs_acls.html): in our case we are
giving users **dberzano** (Dario Berzano) and **litmaath** (Maarten Litmaath)
write permissions, *i.e.* they can change files (but not the ACL).

To list current permissions (`la` means `listacl`):

```bash
$> fs la /afs/cern.ch/alice/offline/vaf/private
Access list for /afs/cern.ch/alice/offline/vaf/private is
Normal rights:
  z2:admin rlidwka
  system:administrators rlidwka
  litmaath rlidwk
  dberzano rlidwk
```

> It is critical that information inside this directory is private!


Monitoring
----------

Monitoring daemon and scripts can be found on AFS:

```
/afs/cern.ch/alice/offline/vaf/monitor
```

To enable monitoring on all nodes put this line in the crontab for user
`cloud-user` (or any other unprivileged one):

```
@reboot  /afs/cern.ch/alice/offline/vaf/monitor/aaf-apmon-run.sh
0 * * * *  /afs/cern.ch/alice/offline/vaf/monitor/aaf-apmon-run.sh
```

On the master node add the `-master` parameter:

```
@reboot  /afs/cern.ch/alice/offline/vaf/monitor/aaf-apmon-run.sh -master
0 * * * *  /afs/cern.ch/alice/offline/vaf/monitor/aaf-apmon-run.sh -master
```

### Monitoring information

VAF monitoring occurs via ApMon and it is visible on MonALISA. Every host sends
default ApMon information (such as `bogomips` and network traffic), plus the
following variable:

* `disk_root_free_mb`: MB free on the disk mounted as root.

Default monitoring information is sent to the following cluster:

```
PROOF::CAF::STORAGE_xrootd_Nodes
```

The master node sends the following information:

* `running_users`: number of users with running jobs. This can be considered as
  the number of connected users.
* `total_slots`: available job slots.
* `free_slots`: free job slots.
* `running_workers`: total number of running PoD workers.
* `waiting_workers`: total number of waiting PoD workers.

Global information is sent to the following cluster:

```
PROOF::CAF::STORAGE_manager_xrootd_Services
```

All information is sent to `aliendb1.cern.ch`.

Parallel SSH on all VAF nodes
-----------------------------

A convenient `mpssh` slightly adapted for VAF is available. To use it, run:

```bash
/afs/cern.ch/alice/offline/vaf/tools/mpssh/mpssh-vaf [-f 'filter'] 'remote command line'
```

The correct key, readable only by VAF admins from AFS, will be used, and all
commands are executed as `cloud-user`. To execute commands as `root` simply
append `sudo` to the remote command line.

The list of nodes is grabbed automatically via the EC2 interface for the correct
tenant. The optional `-f <filter>` option allows specifying an additional `grep`
to filter (out) the desired hosts: this filter will be applied to the
`euca-describe-instances` output.

For example, to execute `uptime` on all head nodes, whose name contains `alivaf`:

```bash
/afs/cern.ch/alice/offline/vaf/tools/mpssh/mpssh-vaf -f alivaf uptime
```

To execute the same command on all nodes *not* matching `alivaf`:

```bash
/afs/cern.ch/alice/offline/vaf/tools/mpssh/mpssh-vaf -f '-v alivaf' uptime
```

Common problems
---------------

### Disk full

In case something goes wrong, stale data might fill up the disks. In case this
happens, the quickest way to solve the problem is to identify the culprits by
either using [the monitoring](http://alimonitor.cern.ch/stats?page=CAF2/table)
(you can sort by the *Disk free* column) and checking the available spaces, or
by running:

```bash
/afs/cern.ch/alice/offline/vaf/tools/mpssh/mpssh-vaf -f '-v alivaf' 'df -h /'
```

Nodes with a low disk space can be fixed on the fly by simply deleting them from
the OpenStack interface, and `elastiq` will bring new ones up again
automatically. This is by far the most effective solution.

For a more fine-grained approach, bear in mind that the directories that tend to
fill up are `/tmp` and the Condor execute directories. Just stop Condor, clean
them up and restart it:

```bash
/afs/cern.ch/alice/offline/vaf/tools/mpssh/mpssh-vaf -f '-v alivaf' \
  'sudo service condor stop; sudo rm -rf /tmp/*; sudo rm -rf /var/lib/condor/execute/*; sudo service condor start'
```
