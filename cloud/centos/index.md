---
title: "CentOS 6 Cloud Image"
layout: tweet

createtoc: true
parnumbers: true
---


Download
--------

Latest image is **CentOS 6.5 (custom build v7) - Sep 25, 2014**:

* [Download image](http://personalpages.to.infn.it/~berzano/cloud-images/CentOS65-x86_64-build7-compat0.10.qcow2) (~700 MB)
* [GPG signature](http://personalpages.to.infn.it/~berzano/cloud-images/CentOS65-x86_64-build7-compat0.10.qcow2.sig)


### Features

* Minimal **[CentOS](http://www.centos.org/) 6 x86_64** installation
* **qcow2** format, v0.10
* **Single root partition** (no swap) that **automatically grows** to
  the full backing block device where applicable (*e.g.* virtual
  machines on LVM logical volumes)
* **[cloud-init](http://cloudinit.readthedocs.org/en/latest/) v0.7.4**
  (configured with support for EC2 metadata server, packages
  installation, Yum repository addition, mount points manipulation)
* **[CernVM-FS](http://cernvm.cern.ch/portal/startcvmfs) v2.1.19**
  (unconfigured and disabled by default)
* **[HTCondor](http://research.cs.wisc.edu/htcondor/) v8.2.2**
  (unconfigured and disabled by default)

> **Caveat!** Image comes with a default root password *(pippo123)*: it
> can be disabled during contextualization as explained below.


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
