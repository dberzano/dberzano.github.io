---
title: "AliRoot prerequisites for OS X"
layout: tweet
---

By following these instructions you will prepare your OS X for
building and using AliRoot.


Install XQuartz
---------------

[XQuartz](http://xquartz.macosforge.org/) is a X server for OS X. You
do not need X to use ROOT from your Mac, but you might need it in case
you want to run graphical programs from a remote host via SSH.

* Download the latest version from the
  [website](http://xquartz.macosforge.org/): you will find it in the
  **Quick Download** section.
* Open the downloaded **.dmg** file.
* Double click on the **XQuartz.pkg** file to install it and follow the
  on-screen instructions.

After you have installed XQuartz, you must log out and log in again.
Note that this is not an optional step.


Install Xcode
-------------

Xcode is the official package for software development on OS X: it
contains all the necessary development tools and a development
environment.

Xcode is distributed by Apple via the App Store:

* Open the App Store
* Search for Xcode
* Click on Install *(the installation is free)*

> If you are using OS X Mavericks, you need to upgrade to Xcode 5.
> Previous versions of Xcode will not work on Mavericks.


### Command Line Tools

Command line tools (such as `make` or `clang`) are not immediately
available after installing or upgrading Xcode.

* Open Xcode
* Click on the **Xcode** boldface menu next to the apple sign
* Go to **Open Developer Tool → More Developer Tools...** like shown
  in the picture below

![Install command line tools](/images/xcode_cmd_line.jpg)

A webpage will open: you can download the **Command Line Tools for
Xcode** that match your system and Xcode version from there.

> Make sure that you select the appropriate version of the Command
> Line Tools: mismatching versions will cause unexpected results.

Check if you have the command line tools properly installed by typing
in a terminal:

```console
$> clang -v
Apple LLVM version 5.1 (clang-503.0.40) (based on LLVM 3.4svn)
Target: x86_64-apple-darwin13.1.0
Thread model: posix
```

> Please note that you must repeat this procedure every time a new
> version of Xcode is installed: it is easy to forget doing that since
> Xcode might get automatic updates from the App Store.


Install gfortran
----------------

No Fortran compiler is supplied by Xcode: you need to install it on
your own.

There is a [website](http://gcc.gnu.org/wiki/GFortranBinaries#MacOS)
where you can download gfortran for various OS X version. For
convenience here are the direct links:

* [gfortran for OS X Mavericks (10.9)](http://coudert.name/software/gfortran-4.9.0-Mavericks.dmg)
* [gfortran for OS X Mountain Lion (10.8)](http://coudert.name/software/gfortran-4.8.2-MountainLion.dmg)


Install CMake
-------------

CMake is required to build AliRoot. You need to have at least
**version 2.8.4**: check with:

```console
$> cmake --version
cmake version 2.8.8
```

Before installing CMake, remove any previous version left on the
system. Open a terminal and type:

```sh
cd /usr/bin
sudo rm -f ccmake cmake cmake-gui cmakexbuild cpack ctest
```

Now get the latest version of CMake from the official website. For
convenience we provide the direct link:

* [CMake 2.8.12.2](http://www.cmake.org/files/v2.8/cmake-2.8.12.2-Darwin64-universal.dmg)

When the download is finished, proceed with the installation.

* Open the downloaded **.dmg** file
* Double-click on the **.pkg** file
* Follow the on-screen instructions and **always accept the default
  installation options**


Install Homebrew
----------------

> Installing Homebrew is optional but strongly recommended.

[Homebrew](http://brew.sh) is a package manager for OS X. Various
utilities are conveniently distributed via Homebrew.

[The website](http://brew.sh) has incredibly simple instructions for
installing it: look for the **Install Homebrew** section at the bottom
of the page.


Install CGAL (for FastJet)
--------------------------

> You need to install [CGAL](http://www.cgal.org/) only if you use
> [FastJet](http://fastjet.fr/). This procedure assumes you have
> Homebrew installed.

Simply do (**don't** do it as root, **don't** prepend `sudo`):

```sh
brew install cgal
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


Install autotools
-----------------

> You need autotools to compile AliEn. The following instructions
> assume you have Homebrew installed.

Simply do (**don't** do it as root, **don't** prepend `sudo`):

```sh
brew install automake autoconf libtool
```
