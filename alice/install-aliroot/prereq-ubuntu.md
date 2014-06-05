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
