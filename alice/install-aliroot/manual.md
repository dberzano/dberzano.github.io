---
title: "Automatic AliRoot installation"
layout: tweet

createtoc: true
parnumbers: true
---


This page will guide you in setting up a fully fledged AliRoot
installation on your system, being it a Max or a Linux box running
[Ubuntu](http://www.ubuntu.com) or derivatives such as
[Linux Mint](http://www.linuxmint.com).

Consider this installation procedure as a suggestion: the experienced
user might find herself at ease with a customized installation,
whereas the unexperienced one is strongly advised to stick to the
instructions.

> Please note that every step in this setup procedure must be intended
> as **strictly required** and **might not be skipped** unless
> otherwise specified.


In trouble? Ask for support!
----------------------------

For any form of support, contact the following mailing list:

* <alice-project-analysis-task-force@cern.ch>

You can subscribe from [CERN e-groups](https://e-groups.cern.ch/).

**Please** don't write personal emails. Mailing list makes support
more efficient as other users might benefit from a single reply.


Prepare your environment
------------------------


### System-wise prerequisites

Supported operating systems have different prerequisites:

* [Ubuntu](../prereq-ubuntu) *(and derivatives)* 12.04 LTS, 12.10, 13.04,
  13.10, 14.04 LTS
* [OS X](../prereq-osx) Mountain Lion (10.8) and Mavericks (10.9)

> Your operating system has to be considered as **not supported**
> unless it is **explicitly** mentioned in the above list.


### Configure your shell environment

The following script helps you to set the environment variables needed
in order to build and use AliRoot: it is meant to be slightly edited
in order to customize the installation prefix and to specify which
ROOT, Geant 3 and AliRoot "triads" are available on your machine.

It is also possible to include a fourth optional element to the
"triad", specifying the [FastJet](http://fastjet.fr/) version. FastJet
is **optional**: if no fourth element is specified, FastJet will not
be installed or enabled.

Download the environment script:

* [alice-env.sh](https://raw.github.com/dberzano/cern-alice-setup/master/alice-env.sh)

You need to change only the "triads" section, which looks like this:

```bash
# Triads in the form "ROOT Geant3 AliRoot [FastJet]". Indices starts from 1,
# not 0. The FastJet entry is optional.
# More information: http://aliceinfo.cern.ch/Offline/AliRoot/Releases.html
TRIAD[1]="v5-34-11 v1-15a master 2.4.5"
TRIAD[2]="v5-34-00-patches trunk master"
# ...add more "triads" here without skipping array indices...
```

You must "source" this script every time you intend to run or build
the framework: an interactive menu will be presented, allowing you to
choose your desired triad.

Every time you re-source the script in the same environment (*i.e.*,
in the same terminal "window"), the old environment variables are
wiped out in order to avoid clashes. So, there is no need to open a
new terminal in order to switch between different AliRoot versions.


#### AliRoot version dependencies

You cannot just pick any triad and expect it to work. Some versions of
AliRoot work only with a specific version of ROOT, and in general they
may be used with any other ROOT version.

* [List of valid ROOT, Geant 3 and AliRoot combinations](http://alimonitor.cern.ch/packages)

It is possible that you will not find in the source repositories the
*exact* version of a certain software you have read from the list. For
instance:

* you will *not* find Geant 3 **v1-15-1**
* you will find instead only **v1-15**

This is because the list might specify build numbers, *e.g.* to
distinguish different Geant 3 versions built upon different ROOT
versions and compile-time options, a dash plus a version number are
appended.

If your download fails because you cannot find the specified version,
try to strip the final dash and the number, and try again.


#### Environment variables syntax

The syntax to source the script is simple. Assuming the full path to
the script is `/opt/alice/alice-env.sh`, you will do:

```bash
source /opt/alice/alice-env.sh [-q] [-n] [-c]
```

As you can see, some optional switches are available (squared
parentheses conventionally indicate optional arguments and you
should not type them literally):

* `-n`: AliRoot environment is set up non-interactively, meaning that
  no menu is presented to the user; the preferred "triad" is selected
  from the variable `$N_TRIAD` that you can change directly inside the
  script
* `-q`: quiet mode. This is useful if you source the script
  automatically from `.bashrc` and you do not want to see the output
  every time you open a new shell.
* `-c`: cleans environment from previously set ALICE variables without
  setting an AliRoot version.

This script also sets a variable, `$MJ`, that you can pass as a
parameter to `make` in order to set the number of parallel operations:

```bash
make -j$MJ
```

This variable is automatically set to the number of cores of your
system plus one.

If you have more than one core on your system and you intend do other
work while compiling, it is recommended that you always run `make`
**without** the `-j` option in order to avoid slowing down your work.


#### Load ALICE environment easily

If you use Bash, the default shell on Ubuntu and OS X, you can simply
append the following snippet to your `~/.bashrc` using your favorite
editor:

```bash
# Load environment variables by simply typing "ali"
alias ali='source /opt/alice/alice-env.sh'
```

It will be possible to load the ALICE environment variables by simply
typing `ali` instead of the long `source` command.


Get and build the software
--------------------------


### AliEn

First of all source the environment variables. Then, copy and paste
the following command:

```bash
cd /tmp
bash <(curl -fSsL http://alien.cern.ch/alien-installer) -install-dir "$ALIEN_DIR" -batch -notorrent -type compile
```

AliEn will be compiled for your system.

**In case you are using OS X** you need Autotools installed for this
step to work. If you have followed the [instructions](../prereq-osx)
then you already have them installed.

After reinstalling AliEn, you **must** destroy any token created with
previous versions before creating a new one:

```bash
alien-token-destroy
alien-token-init
```


### ROOT

[ROOT](http://root.cern.ch) has its source available on
[Git](http://git-scm.com).


#### Clone the Git ROOT repository (only once)

**The first time you install it** you must create a local clone of the
ROOT repository. The local Git clone will contain the source code for
**all** ROOT versions (inside hidden files) and you can switch the
source in your working directory with appropriate commands.

**Remember:** the Git clone has to be performed **only once**. If you
have already a Git clone of ROOT on your system, jump to the next
step.

Source the environment variables. Then create a directory for the ROOT
Git clone:

```bash
mkdir -p "$ALICE_PREFIX/root/git"
```

Move into that directory and clone the repository:

```bash
cd "$ALICE_PREFIX/root/git"
git clone http://root.cern.ch/git/root.git .
```

The last command is expected to take some time.


#### Select your ROOT version, stage it and compile it

Your environment variables must be sourced. Move to the Git clone
directory and update the list of remote branches:

```bash
cd "$ALICE_PREFIX/root/git"
git remote update origin
git remote prune origin
```

Checkout your desired ROOT version:

```bash
git checkout "$ROOT_VER"
```

**Please note** that the SVN *trunk* does not exist anymore. In Git's
speech, it is now called *the master branch*.

If your ROOT version is either a `master` or a development branch (such
as `v5-34-00-patches`), update it:

```bash
git pull --rebase
```

This obviously does not apply to tagged versions (such as `v5-34-07`).
In case you accidentally executed the command for a "non-updatable"
version, the command will fail without any consequences.

To avoid the confusion of having several versions of ROOT under the
same directory, stage the checked out version in a separate
directory:

```
rsync -avc --exclude '**/.git' "$ALICE_PREFIX/root/git/" "$ROOTSYS"
```

**Please note** that with `rsync` the trailing slash on the source
path is **non-optional**!

Now, move into ROOT's source directory:

```bash
cd "$ROOTSYS"
```

The following step is very important, because it is the place where
you customize your own ROOT installation based on your needs: Geant 3
and AliRoot will rely on ROOT's configuration to compile.

On **OS X**, configure it with:

```bash
./configure \
  --with-pythia6-uscore=SINGLE \
  --with-alien-incdir=$GSHELL_ROOT/include \
  --with-alien-libdir=$GSHELL_ROOT/lib \
  --with-monalisa-incdir="$GSHELL_ROOT/include" \
  --with-monalisa-libdir="$GSHELL_ROOT/lib" \
  --with-xrootd=$GSHELL_ROOT \
  --with-f77=/usr/local/bin/gfortran \
  --with-clang \
  --enable-minuit2 \
  --enable-roofit \
  --enable-soversion \
  --disable-bonjour \
  --enable-builtin-freetype \
  --disable-fink \
  --enable-cocoa
```

On **Ubuntu**:

```bash
./configure \
  --with-pythia6-uscore=SINGLE \
  --with-alien-incdir=$GSHELL_ROOT/include \
  --with-alien-libdir=$GSHELL_ROOT/lib \
  --with-monalisa-incdir="$GSHELL_ROOT/include" \
  --with-monalisa-libdir="$GSHELL_ROOT/lib" \
  --with-xrootd=$GSHELL_ROOT \
  --with-f77=gfortran \
  --enable-minuit2 \
  --enable-roofit \
  --enable-soversion \
  --disable-bonjour
```

After configuring it, make sure that the list of "enabled features"
contains **opengl**. You can quickly check with:

```console
$> root-config --features | grep -q opengl && echo OK
OK
```

If `OK` is displayed, then you are good to go.

**Note:** you may need to use different `--enable-` or `--disable-`
switches to suit your needs: bear in mind that enabling some switches
is likely to require external packages not mentioned in this guide.

**Very important!** When you're done compiling ROOT, you must source
**again** the environment script before you can use it!































