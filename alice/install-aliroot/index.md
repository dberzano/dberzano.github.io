---
title: "AliRoot installation"
layout: tweet

parnumbers: false
createtoc: false
---

Use ALICE precompiled binaries
------------------------------

You can use the same AliPhysics, AliRoot, etc. versions available on the Grid
without compiling them.

* [Get ALICE software via CVMFS](cvmfs)
* [Install RPMs using Yum](rpms)


Compile ALICE software from source
----------------------------------

Instructions for compiling ALICE software from source are provided for
[Ubuntu](http://www.ubuntu.com/), [Fedora](http://fedoraproject.org/)
and [OS X](http://www.apple.com/osx). Check whether your version is
supported, and be sure it complies with the **prerequisites**:

* [Ubuntu 64 bit](prereq-ubuntu) 12.04 LTS, 12.10, 13.04, 13.10, 14.04 LTS, 14.10, 15.04
* [Fedora 64 bit](prereq-fedora) 21
* [CERN CentOS 7](prereq-cc7)
* [OS X](prereq-osx) Yosemite (10.10) and El Capitan (10.11)

Each of the operating systems listed above has been tested: it is possible that
*similar* or *derived* distributions (such as Linux Mint for Ubuntu or SLC6 for
Fedora or CC7) work with the same instructions given some little
distribution-specific adaptation.

Two installation options are possible:

* [Automatic installation](auto) *(recommended for beginners)*
* [Manual installation](manual)


### Support policy

> Your Operating System is **not supported** unless it is explicitly listed
> above. Only 64 bit architectures are supported.

For Ubuntu we support the latest release, plus all the LTS that did not reach
their [end of life](https://wiki.ubuntu.com/Releases) yet.

For OS X, a rapidly changing Operating System, we support only the **latest two
releases**. Betas and Developer Previews are not supported.
