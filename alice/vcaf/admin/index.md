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
