---
title: "AliRoot Release Validation on the Cloud"
layout: tweet

createtoc: true
parnumbers: true
---


This guide will walk you through the process of running the Release
Validation of a certain AliRoot tag.


Before you begin
----------------


### AliRoot version on CernVM-FS

The AliRoot version you want to test must be published on CernVM-FS.

Run the validation program directly from the AliRoot master on Git:

```bash
git clone http://git.cern.ch/pub/AliRoot <aliroot_prefix>/
git checkout master
```

Release validation is under the `PWGPP/benchmark` directory.


### EC2 cloud credentials

You must have access to your cloud via the EC2 API. How to get those
credentials depends on your cloud provider.


#### CERN Agile Infrastructure

If you are planning to use the
[CERN Agile Infrastructure](https://openstack.cern.ch) based on
[OpenStack](https://www.openstack.org), after you have logged in:

 * go to **Access & Security**
 * select the **API Access** tab
 * press the **Download EC2 Credentials** button

You will obtain a .zip file containing all your credentials. Do:

```bash
mkdir ec2_creds
unzip <path_to_archive.zip>
```

then load your credentials:

```bash
source ec2rc.sh
```

If you want to load them automatically, find out the following three
relevant variables:

```bash
echo $EC2_URL
echo $EC2_ACCESS_KEY
echo $EC2_SECRET_KEY
```

and save them in a configuration file as explained in the next
paragraph.


#### Other sites

You need to have at least three environment variables exported in your
shell environment:

 * `EC2_URL`: points to the API endpoint URL
 * `EC2_ACCESS_KEY`: the EC2 access key, *i.e.* your "username"
 * `EC2_SECRET_KEY`: the EC2 secret key, *i.e.* your "password"

You can either export those variables manually, or if you prefer you
can create a file under your `benchmark.config.d` directory. Move to
it:

```bash
cd <aliroot_prefix>/PWGPP/benchmark/benchmark.config.d
```

Create a file named `60ec2_creds.config` containing the following
lines properly set:

```bash
export EC2_ACCESS_KEY='your_ec2_access_key'
export EC2_SECRET_KEY='your_ec2_secret_key'
export EC2_URL='http://your/ec2/api/url/'
```

**Note:** the filename does not matter, provided that it ends in
`.config`. Files are processed in alphabetical order, so greater
prefix numbers override lower numbers.


### Install euca2ools

[euca2ools](https://www.eucalyptus.com/download/euca2ools) are the
client tools you need to access any EC2-compatible cloud.

On an **Ubuntu** machine:

```bash
apt-get install euca2ools
```

On **OS X** with [Homebrew](http://brew.sh):

```bash
brew install euca2ools
```


### CernVM 3

You need to register the CernVM 3 image to your cloud, and have its
"AMI ID", *i.e.* an ID that identifies them to the EC2 API.

Get it from here:

 * [CernVM Download Page](http://cernvm.cern.ch/portal/downloads)

The most common setup is using "raw" images with the KVM hypervisor.
If in doubt on what image to pick, try the following:

 * [Direct link to the latest CernVM for KVM](http://cernvm.cern.ch/releases/ucernvm-images.1.18-1.cernvm.x86_64/ucernvm-prod.1.18-1.cernvm.x86_64.hdd)

It is easy to use the web interface of your cloud to register the
image. In case you are using OpenStack:

 * go to **Images & Snapshots**
 * press the **Create Image** button on top right

A modal window opens:

 * type in the **Name** you want
 * type the URL of the image to upload: you can use your browser to
   get it from the download links provided
 * select **Raw** from the **Format** field
 * press the blue **Create Image** button

After the image has been created, find out the AMI ID from a console:

```bash
euca-describe-instances
```

The AMI ID will be something like `ami-01234567` on the line
corresponding to your image.


Create a Cluster profile on CernVM Online
-----------------------------------------

First of all, go to [CernVM Online](https://cernvm-online.cern.ch) and
log in with your CERN credentials.


### Get Head node and Worker node templates

Go to the **Marketplace** and choose the **ALICE** category. You will
find two virtual machine definitions

 * ALICE Release Validation Head Node
 * ALICE Release Validation Worker Node

You must select both, and "clone" them to your dashboard. When
cloning, you can edit the definitions. The things you need to set are:

 * In the **EOS** section, paste a valid proxy certificate in PEM
   format. This is required to access EOS. You can create the proxy on
   your machine (be sure that it lasts enough time) and find it in
   `/tmp/x509_u$UID`.
 * In **CVMFS Configuration** you might want to set a HTTP proxy to
   speed up data access.
 * In the **Condor Batch** section you can change the "shared secret".

There is likely nothing else you need to modify.

**Note:** make the same modifications in the head node and worker node
definitions! For instance, if the Condor shared secret is not the
same, worker nodes will not be able to connect to the head node.

> Please **encrypt** your context as it contains sensitive information
> (such as a Grid proxy and the Condor secret): you can set a password
> under the **General** section.
>
> **Do not underestimate** the consequences of not encrypting!


### Create the Cluster profile

You are going to create a cluster capable of expanding and shrinking
automatically, *i.e.* changing its the number of virtual worker nodes.

Go to the **Dashboard** of CernVM Online: under **Your cluster
definitions**, press the green button **Create new cluster**.

 * **EC2 credentials**: use the EC2 environment variables you have
   found out previously
 * **Configuration of the CernVM Virtual Machines**: type in your AMI
   ID you have found out after registering your image. The **Flavour**
   field is the profile of resources associated to all your VMs and
   its definition and name depend on your cloud: it is usually
   something like `m1.large`
 * **Automatic elasticity configuration**: the default parameters
   should work well: you should configure properly the **Number of
   jobs per VM** according to the number of CPUs associated to the
   selected profile
 * **Cluster size limit:** it is safe to leave the minimum number to
   zero; change the maximum number to an appropriate value
 * **Context for the Head/Worker node:** select the contexts you have
   modified: remember to provide their passwords if you have encrypted
   them

Save the cluster definition when finished.

> Please **encrypt** the cluster definition as it contains your EC2
> credentials, which should be kept private.


### Get the cluster profile

On the CernVM Online **Dashboard**, press the green **Deploy** button
for your cluster definition: a password may be asked if you have
encrypted the context.

Go to the **user-data** tab: there will be a short text file similar
to:

```ini
[amiconfig]
plugins=cernvm
[cernvm]
contextualization_key=cbe41cfaa6b746feb0e645f587203f42:password
[ucernvm-begin]
resize_rootfs=true
cvmfs_branch=cernvm-prod.cern.ch
cvmfs_tag=cernvm-system-3.3.0.3
[ucernvm-end]
```

Edit the `PWGPP/benchmark/benchmark.config.d/50cloud.config` file and
paste it as the `cloudUserData` variable, like this:

```bash
cloudUserData=(cat <<_EoF_
[amiconfig]
plugins=cernvm
[cernvm]
contextualization_key=cbe41cda9650467eb0e645f587203f42:password
[ucernvm-begin]
resize_rootfs=true
cvmfs_branch=cernvm-prod.cern.ch
cvmfs_tag=cernvm-system-3.3.0.3
[ucernvm-end]
_EoF_
)
```

The marker `_EoF_` and the closed parenthesis `)` must stay on
separate lines.

**Note:** there is an example file available at
`PWGPP/benchmark/benchmark.config.d/50cloud.config.example`.

