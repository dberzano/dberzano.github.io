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
* [OS X](prereq-osx) Mountain Lion (10.8), Mavericks (10.9) and
  Yosemite (10.10)

> Your operating system's version has to be considered as **not
> supported** unless it is **explicitly** mentioned in the above list.
>
> Only **64 bit operating systems** are supported.

Every listed operating system has been tested: it is possible that
"derivatives" or "similar" versions *(e.g. Linux Mint for Ubuntu, SLC6
for Fedora)* work with no or little adaptation of the above
instructions.

Two installation options are possible:

* [Automatic installation](auto) *(recommended for beginners)*
* [Manual installation](manual)


### Compatibility grid

Some components of the ALICE framework might have compatibility
problems with certain operating systems: the following grid
illustrates such special cases and indicates the correct version range
of the component compatible with each operating system.

|                        | ROOT      | FastJet 2           | FastJet 3 |
| ---------------------- |:---------:|:-------------------:|:---------:|
| **Ubuntu**             |           | ≥ 2.4.5             |           |
| **OS X Mountain Lion** | ≥ 5.34.18 | ≥ 2.4.5<sup>†</sup> | ≥ 3.0.6   |
| **OS X Mavericks**     | ≥ 5.34.18 | ≥ 2.4.5<sup>†</sup> | ≥ 3.0.6   |
| **OS X Yosemite**      | ≥ 5.34.22 | ≥ 2.4.5<sup>†</sup> | ≥ 3.0.6   |


#### Notes

<sup>†</sup> On OS X you need to patch FastJet 2 before compiling it:
the [manual](manual) installation procedure explains you how. The
[automatic](auto) procedure does it for you.

See the [FastJet release notes](http://fastjet.fr/all-releases.html)
for a more detailed explanation.


Use AliRoot without compiling it
--------------------------------

If you want you can use the same AliRoot versions available on the
Grid without compiling them by means of cvmfs.

* [Use AliRoot from cvmfs](cvmfs)
