---
title: "AliRoot prerequisites for Ubuntu"
layout: tweet
---

Follow the instructions on this page carefully to prepare your Ubuntu
installation for building and using AliRoot. These instructions also
work for Ubuntu derivatives, like
[Linux Mint](http://www.linuxmint.com).

> A list of Linux Mint releases with the Ubuntu verions they are based
> on can be found
> [here](http://en.wikipedia.org/wiki/List_of_Linux_Mint_releases).


Remove ROOT versions installed via a package manager
----------------------------------------------------

Our AliRoot installation procedure conflicts with ROOT versions
installed via a package manager like `apt-get` or `aptitude`: remove
them before proceeding.

To check if you have any ROOT version installed this way, run:

```sh
dpkg --get-selections | grep root-system
```

If you see the word **installed** next to packages whose name starts
with **root-system**, please remove them by giving:

```sh
sudo apt-get purge root-system-XXX root-system-YYY...
```

You need to substitute the placeholders with the appropriate package
names.


Required packages
-----------------

First, update the list of available packages:

```sh
sudo apt-get update
```

Then install all the required packages with a single command *(please
note that it is a long line)*:

```sh
sudo apt-get install curl build-essential gfortran subversion cmake libmysqlclient-dev xorg-dev libglu1-mesa-dev libfftw3-dev libssl-dev libxml2-dev libtool automake git unzip libcgal-dev
```

You can compile everything using Clang if you want: if this is the
case, install it:

```sh
sudo apt-get install clang-3.4
```

**Note:** the `clang-3.5` package on Ubuntu 14.10 has known problems
preventing ROOT from compiling, while 3.4 works without flaws.

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
