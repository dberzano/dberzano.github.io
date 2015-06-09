---
title: "Virtual CERN Analysis Facility for administrators"
layout: tweet

parnumbers: false
createtoc: false
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
base image. The base image is a [CentOS 6](http://wiki.centos.org/) installation
supporting [cloud-init](https://cloudinit.readthedocs.org/en/latest/):
[more information is available here](/cloud/centos).

The original VAF runs on [CernVM](http://cernvm.cern.ch/): this is not the case
for the Virtual CERN Analysis Facility as it needs AFS for user home
directories for their convenience.

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


### Starting the head node

Click on the **Launch Instance** button, then:

* Instance Name: **alivaf-000** (do not use any other name!)
* Flavor: **m1.medium** (we do not need a larger VM for this purpose)
* Instance Boot Source: **Boot from image**
* Image Name: **CentOS6-buildXXX** (substitute XXX with the most recent number)

On the **Access & Security** tab you must pick the **AliceVCAF** keypair.

On the **Post-Creation** tab, provide the contextualization file `cern-vaf-head`
from the private area. This file is not public as it contains sensitive
information.

That is it, you can click the **Launch** button and wait.


### Starting multiple submit nodes

Click on the **Launch Instance** button, then:

* Instance Name: **alivaf-000** (do not use any other name!)
* Flavor: **m1.large** (we do not need a larger VM for this purpose)
* Instance Boot Source: **Boot from image**
* Image Name: **CentOS6-buildXXX** (substitute XXX with the most recent number)

On the **Access & Security** tab you must pick the **AliceVCAF** keypair.

On the **Post-Creation** tab, provide the contextualization file
`cern-vaf-submit` from the private area. This file is not public as it contains
sensitive information.

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
