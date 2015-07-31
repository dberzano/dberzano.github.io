---
title: "AliRoot prerequisites for CERN CentOS 7"
layout: tweet
---

Follow these instructions to prepare your CERN CentOS 7 system to run AliRoot.


Additional repositories
-----------------------

The default repositories provided with CERN CentOS 7 miss **libCGAL**, which is
required to build FastJet.

We therefore need to add an additional repository, [ATrpms](http://atrpms.net).

Import the GPG key (it's used by Yum to authenticate the RPMs). As root:

```bash
rpm --import http://packages.atrpms.net/RPM-GPG-KEY.atrpms
```

Configure the new repository. Create with your favorite editor the file
**/etc/yum.repos.d/atrpms.repo** with the following content:

```ini
[atrpms]
name=CC $releasever - $basearch - ATrpms
baseurl=http://dl.atrpms.net/el$releasever-$basearch/atrpms/stable
gpgkey=http://ATrpms.net/RPM-GPG-KEY.atrpms
gpgcheck=1
# low priority
priority=1
```

> We gave the repository a low priority: only packages missing from other repos
> are downloaded from ATrpms.


Required packages
-----------------

Install (always as root or by prepending `sudo`) all the required packages with
a single command *(please note that it is a long line)*:

```bash
yum install autoconf automake libtool zlib-devel libxml2-devel openssl-devel gcc-c++ gcc-gfortran make libX11-devel libXpm-devel libXft-devel libXext-devel mesa-libGLU-devel subversion git CGAL-devel
```

**Note:** system's CMake is not recent enough to build AliRoot. It has to be
installed separately as explained [below](#install_cmake).


Install CMake
-------------

You need at least CMake 2.8.12 to build ALICE software. The first step is to
make sure you do not have `cmake` coming from a package:

```
yum remove -y cmake
```

Pick a CMake version from the [downloads page](http://www.cmake.org/download/):
please download the `.tar.gz`. The latest version usually works.

Then unpack it in a temporary directory:

```bash
tar xzf /path/to/your/cmake-<your_cmake_version>.tar.gz
cd cmake-<your_cmake_version>
```

Now build it (do not do it as root):

```bash
./bootstrap
make -j$(grep -c bogomips /proc/cpuinfo)
```

Now install it (you need root permissions here):

```
sudo make install
```

Installation will occur under `/usr/local`.


git-new-workdir
---------------

Check if you have the executable named `git-new-workdir` available in your
`$PATH`:

```bash
which git-new-workdir
```

If nothing appears, you do not have it installed. Install it system-wide:

```bash
sudo curl -kL https://raw.github.com/gerrywastaken/git-new-workdir/master/git-new-workdir -o /usr/bin/git-new-workdir
sudo chmod +x /usr/bin/git-new-workdir
```
