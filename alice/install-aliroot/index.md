---
title: "AliRoot installation"
layout: tweet

parnumbers: false
createtoc: false
---


Compile AliRoot from source
---------------------------

Instructions for compiling AliRoot from source are provided for
[Ubuntu](http://www.ubuntu.com/) and [OS X](http://www.apple.com/osx).
Check whether your version is supported, and be sure it complies with
the **prerequisites**:

* [Ubuntu](prereq-ubuntu) *(and derivatives)* 12.04 LTS, 12.10, 13.04,
  13.10, 14.04 LTS
* [OS X](prereq-osx) Mountain Lion (10.8) and Mavericks (10.9)

> Your operating system's version has to be considered as **not
> supported** unless it is **explicitly** mentioned in the above list.

Two installation options are possible:

* [Automatic installation](auto) *(recommended for beginners)*
* [Manual installation](manual)


### Compatibility grid

Some components of the ALICE framework might have compatibility
problems with certain operating systems: the following grid
illustrates such special cases and indicates the correct version range
of the component compatible with each operating system.

|            | ROOT      | FastJet 2           | FastJet 3 |
| ---------- |:---------:|:-------------------:|:---------:|
| **Ubuntu** |           | ≥ 2.4.5             |           |
| **OS X**   | ≥ 5.34.18 | ≥ 2.4.5<sup>†</sup> | ≥ 3.0.6   |


#### Notes

<sup>†</sup> On OS X you need to patch FastJet 2 before compiling it: the
[manual](manual) installation procedure explains you how. The
[automatic](auto) procedure does it for you.

See the
[release notes of FastJet](http://fastjet.fr/all-releases.html) for
more detailed explanations.


Use AliRoot without compiling it
--------------------------------

If you want you can use the same AliRoot versions available on the
Grid without compiling them by means of cvmfs.

* [Use AliRoot from cvmfs](cvmfs)
