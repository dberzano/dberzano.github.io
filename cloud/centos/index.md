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

* **Minimal** [CentOS](http://www.centos.org/) 6 installation
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
