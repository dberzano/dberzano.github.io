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
yum install autoconf automake libtool cmake zlib-devel libxml2-devel openssl-devel gcc-c++ gcc-gfortran make libX11-devel libXpm-devel libXft-devel libXext-devel mesa-libGLU-devel subversion git CGAL-devel
```


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
