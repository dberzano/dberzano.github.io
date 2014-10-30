---
title: "AliRoot prerequisites for Fedora"
layout: tweet
---

Follow these instructions to prepare your Fedora system to run
AliRoot.


Required packages
-----------------

Update the list of available packages. As root, or with `sudo`:

```bash
yum update
```

Then install (always as root or by prepending `sudo`) all the required
packages with a single command *(please note that it is a long line)*:

```bash
yum install autoconf automake libtool cmake zlib-devel libxml2-devel openssl-devel gcc-c++ gcc-gfortran make libX11-devel libXpm-devel libXft-devel libXext-devel mesa-libGLU-devel subversion
```

Please note that you should have at least **CMake v2.8.8**. You can
check with:

```console
$> cmake --version
cmake version 2.8.12.2
```

If you do not have this version available with your Ubuntu version,
you will need to
[install one manually](http://www.cmake.org/download/).


git-new-workdir
---------------

Check if you have the executable named `git-new-workdir` available in
your `$PATH`:

```sh
which git-new-workdir
```

If nothing appears, you do not have it installed. Install it
system-wide:

```sh
sudo curl -L https://raw.github.com/gerrywastaken/git-new-workdir/master/git-new-workdir -o /usr/bin/git-new-workdir
sudo chmod +x /usr/bin/git-new-workdir
```
