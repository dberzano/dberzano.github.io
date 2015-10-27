---
title: "AliRoot prerequisites for OS X"
layout: tweet
---

By following these instructions you will prepare your OS X for
building and using AliRoot.


Install Xcode
-------------

Xcode is the official package for software development on OS X: it
contains all the necessary development tools and a development
environment.

Xcode is distributed by Apple via the App Store:

* Open the App Store
* Search for Xcode
* Click on Install *(the installation is free)*

Normally a new version of Xcode is released with a new version of OS
X. If you have just upgraded OS X, check if a new version of Xcode is
available from the App Store and **update it**.


### Command Line Tools

Command line developer tools (such as `make`) are not available right
after installing or upgrading Xcode.

* Open Xcode
* Click on the **Xcode** boldface menu next to the apple sign
* Go to **Open Developer Tool → More Developer Tools...** as shown in the
  picture below

![Install command line tools](/images/xcode_cmd_line.jpg)

A webpage will open: you can download the **Command Line Tools for
Xcode** that match your system and Xcode version from there.

> Make sure that you select the appropriate version of the Command
> Line Tools: mismatching versions will cause unexpected results.

Check if you have the command line tools properly installed by typing
in a terminal:

```console
$> clang -v
Apple LLVM version 7.0.0 (clang-700.0.72)
Target: x86_64-apple-darwin15.0.0
Thread model: posix
```

> Please note that **you must repeat this procedure every time a new
> version of Xcode is installed**: it is easy to forget doing that
> since Xcode might get automatic updates from the App Store.

Please also note that you might get prompted, on the command line, for accepting
the license the first time you use a command line tool (such as `git`). You
might notice it because, for instance, the [automatic installer](../auto) fails
unexpectedly.


Install Homebrew
----------------

[Homebrew](http://brew.sh) is a package manager for OS X. Various utilities are
conveniently distributed through it.

[The website](http://brew.sh) has some ridicolously simple installation
instructions.

> Please note that using several package managers for OS X at the same
> time (Homebrew, Fink, MacPorts) is not a good idea!

After you have installed Homebrew, run, as suggested by the installer:

```bash
brew doctor
```

This command will tell you if there is something wrong or some potential pitfall
on your system. **Do not overlook its output!** In particular, pay attention to:

* Warnings for old compilers: **immediately upgrade Xcode and the command line
  tools** if warned to do so!
* Warning for an old XQuartz version: **upgrade XQuartz** as explained later on.


### Upgrade Homebrew and its packages

From time to time, or whenever you change OS X version, you will need
to upgrade your Homebrew installation.

Get the list of new packages with:

```bash
brew update
```

Upgrade all with:

```bash
brew upgrade
```

If you have just upgraded from Mavericks to Yosemite, launching brew
might produce the following output:

```console
$> brew
/usr/local/bin/brew: /usr/local/Library/brew.rb: /System/Library/Frameworks/Ruby.framework/Versions/1.8/usr/bin/ruby: bad interpreter: No such file or directory
/usr/local/bin/brew: line 23: /usr/local/Library/brew.rb: Undefined error: 0
```

Follow the instructions from
[here](http://stackoverflow.com/questions/24225959/how-to-get-ruby-homebrew-rvm-to-work-on-yosemite)
for working around this problem.


Install required Homebrew packages
----------------------------------

After installing Homebrew, do:

```bash
brew install cmake automake autoconf libtool cgal openssl
```

From El Capitan you also need to run:

```
brew link --force openssl
```

because under certain conditions Apple does not install the OpenSSL headers
anymore.

Note that the `cgal` package is required only if using FastJet.


### CMake

At least CMake 2.8.12 is required for ALICE. It is recommended to use Homebrew
to get it. If you have another version of CMake already installed, you have to
remove it manually like this:

```bash
cd /usr/bin
sudo rm -f ccmake cmake cmake-gui cmakexbuild cpack ctest
```

You can check the CMake version with:

```console
$> cmake --version
cmake version 3.3.2
```


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


Install gfortran
----------------

No Fortran compiler is supplied by Xcode: you need to install it on
your own.

A researcher named François-Xavier Coudert kindly maintains binary
packages for gfortran on OS X and publishes them on his
[website](http://coudert.name/). The official
[gfortran webpage of GCC](http://gcc.gnu.org/wiki/GFortranBinaries#MacOS)
also points to it.

For your convenience, we provide direct links for gfortran on various
OS X versions:

* [gfortran 5.2 for OS X El Capitan (10.11)](http://coudert.name/software/gfortran-5.2-Yosemite.dmg)
* [gfortran 4.9.1 for OS X Yosemite (10.10)](http://coudert.name/software/gfortran-4.9.1-Yosemite.dmg)

The installer might complain that the package comes from an "unidentified
developer": you can either disable package checking system-wide from System
Preferences (not reccommended) or opening the package with the right click while
keeping the Option key pressed: this will show you the same warning dialog but
with an "Open" button to proceed regardless.

> Even if you already have gfortran on your system, **upgrade it if
> you have just upgraded your OS X version!**


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
sudo curl -L https://raw.github.com/gerrywastaken/git-new-workdir/master/git-new-workdir -o /usr/local/bin/git-new-workdir
sudo chmod 0777 /usr/local/bin/git-new-workdir
```

> From El Capitan you cannot install anything under `/usr/bin`, even with
> `sudo`, for security reasons.


Getting stacktraces without password
------------------------------------

To get the usual ROOT automatic stacktrace when something crashes without being
prompted for a password, just type:

```bash
sudo /usr/sbin/DevToolsSecurity --enable
```


System Integrity Protection
---------------------------

Starting from **El Capitan (OS X 10.11)** Apple has introduced [System Integrity
Protection](http://www.macworld.com/article/2986118/security/how-to-modify-system-integrity-protection-in-el-capitan.html),
also known as "rootless mode". As explained
[here](/2015/10/05/el-capitan#system_integrity_protection) this might have an
impact to library loading when you have scripts (or applications) invoking other
scripts.

While we are working on a solution to make ALICE software compliant to this new
security feature you might want to turn it off completely.

> We are not liable for any damage caused by turning System Integrity Protection
> off. Do it only if you know what you are doing!

To turn SIP off:

* Reboot your Mac in Recovery Mode. That is, before OS X starts up, hold down
  Command-R and keep both keys pressed until the Apple logo appears along with
  a progress bar.
* From the Utilities menu open a Terminal.
* At the shell type: `csrutil disable`: a message will notify the success of
  your operation.
* Now from the  menu select Restart.

**Note:** to reenable it use `csrutil enable` instead.
