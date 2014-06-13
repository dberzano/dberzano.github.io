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
