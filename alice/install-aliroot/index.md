---
title: "AliRoot installation"
layout: tweet

parnumbers: false
createtoc: false
---


Compile AliRoot from source
---------------------------

Instructions for compiling AliRoot from source are provided for
[Ubuntu](http://www.ubuntu.com/), [Fedora](http://fedoraproject.org/)
and [OS X](http://www.apple.com/osx). Check whether your version is
supported, and be sure it complies with the **prerequisites**:

* [Ubuntu 64 bit](prereq-ubuntu) 12.04 LTS, 12.10, 13.04, 13.10,
  14.04 LTS, 14.10
* [Fedora 64 bit](prereq-fedora) 20
* [CERN CentOS 7](prereq-cc7)
* [OS X](prereq-osx) Mavericks (10.9) and Yosemite (10.10)

> Your operating system's version has to be considered as **not
> supported** unless it is **explicitly** mentioned in the above list.
>
> Only **64 bit operating systems** are supported.

Each of the operating systems listed above has been tested: it is possible that
*similar* or *derived* distributions (such as Linux Mint for Ubuntu or SLC6 for
Fedora or CC7) work with the same instructions given some little
distribution-specific adaptation.

Two installation options are possible:

* [Automatic installation](auto) *(recommended for beginners)*
* [Manual installation](manual)


### Compatibility grid

Some components of the ALICE framework might have compatibility
problems with certain operating systems: the following grid
illustrates such special cases and indicates the correct version range
of the component compatible with each operating system.

|                        | ROOT      | FastJet |
| ---------------------- |:---------:|:-------:|
| **Ubuntu**             | ≥ 5.34.08 | ≥ 3.0.6 |
| **OS X Mavericks**     | ≥ 5.34.18 | ≥ 3.0.6 |
| **OS X Yosemite**      | ≥ 5.34.22 | ≥ 3.0.6 |

**Note:** Fastjet 2 is no longer supported.


Use AliRoot without compiling it
--------------------------------

If you want you can use the same AliRoot versions available on the
Grid without compiling them by means of cvmfs.

* [Use AliRoot from cvmfs](cvmfs)
