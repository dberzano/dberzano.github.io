---
title: "Manual AliRoot installation"
layout: tweet

createtoc: true
parnumbers: true
---


This page will guide you in setting up a fully fledged AliRoot
installation on your system, being it [OS X](http://www.apple.com/osx)
or a Linux box running [Ubuntu](http://www.ubuntu.com) or
[Fedora](http://fedoraproject.org/). Derivatives are supported too.

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

> When requesting support, please **always** attach the output file
> produced by the following command:
>
> ```bash
> bash <(curl -fsSL http://cern.ch/go/NcS7) --bugreport
> ```


Prepare your environment
------------------------


### System-wide prerequisites

Supported operating systems have different prerequisites:

* [Ubuntu 64 bit](../prereq-ubuntu) *(and derivatives)*
* [Fedora 64 bit](../prereq-fedora) *(and derivatives)*
* [OS X](../prereq-osx)

You can find [here](..#compile_aliroot_from_source) the detailed list
of compatible operating systems.

> If your OS **and version** are
> [not listed explicitly](../#compile_aliroot_from_source),
> **no support will be provided for it**. In particular, 32 bit OSes
> are not supported.


### Configure your shell environment

You will need a script that helps you setting the environment
variables needed to build and use different ALICE software
combinations, constituted by "tuples" of ROOT, Geant 3 and AliRoot,
plus other optional components.

> As of **Aug 13, 2014**, the way of configuring the environment has
> been **slightly changed**:
> [read here](/2014/08/13/alice-env-changes) how to migrate to the new
> method (it takes less than a minute).

Choose a directory that will contain all ALICE software, *e.g.*
`~/alicesw`. Create it:

```bash
mkdir $HOME/alicesw
```

ALICE has a script to set the shell environment for running the
software:

* [alice-env.sh](https://raw.github.com/dberzano/cern-alice-setup/master/alice-env.sh)
  *([see changes on GitHub](https://github.com/dberzano/cern-alice-setup/blob/master/alice-env.sh))*

Download it into the directory you have just created:

```bash
cd $HOME/alicesw
curl -L https://raw.github.com/dberzano/cern-alice-setup/master/alice-env.sh -o alice-env.sh
```

If you do not have a `alice-env.conf` configuration file in the
same directory of your `alice-env.sh`, run:

```bash
source alice-env.sh
```

Instead of loading the ALICE environment it will create a default
configuration file named `alice-env.conf`. Open it. You will find
something like:

```bash
#!/bin/bash

# Automatically created by alice-env.sh on Thu Nov 20 18:02:07 CET 2014

#
# Software tuples: they start from 1 (not 0) and must be consecutive.
#
# Format (you can also type it on a single long line):
#   AliTuple[n]='root=<rootver> geant3=<geant3ver> aliroot=<alirootver> \
#                aliphysics=<aliphysicsver> fastjet=<fjver> fjcontrib=<fjcontribver>'
#
# Note: FastJet and FJContrib are optional.
#

# No FastJet
AliTuple[1]='root=v5-34-18 geant3=v1-15a aliroot=master aliphysics=master'

# FastJet 3
#AliTuple[2]='root=v5-34-18 geant3=v1-15a aliroot=master aliphysics=master \
#             fastjet=3.0.6 fjcontrib=1.012'

# You can add more tuples
#AliTuple[3]='...'

# Default software tuple (selected when running "source alice-env.sh -n")
export nAliTuple=1
```

> **Note:** config syntax has changed recently: old config files are
upgraded automatically. Details [here](/2014/12/15/aliroot-tuples-cmake).

In this file you define some **software "tuples"**, *i.e.* a
combination of ROOT, Geant 3, AliRoot and AliPhysics (plus other
components if you wish) to use together.

You must "source" the `alice-env.sh` script every time you intend to
run or build the framework: an interactive menu will be presented,
allowing you to choose one of the defined tuples.

Every time you re-source the script in the same environment (*i.e.*,
in the same terminal "window"), the old environment variables are
wiped out in order to avoid unpleasant clashes: it is therefore not
needed to open a new terminal in order to switch between tuples.

The `alice-env.sh` script needs to be downloaded only once. You do not
need to update it: it will periodically update itself automatically.
Whenever it updates, a message is printed to the user.

> Do not edit `alice-env.sh` directly: use the separate
> `alice-env.conf` for configuring the variables. Automatic updates
> will **destroy any changes of yours** in `alice-env.sh`!


#### AliRoot version dependencies

You cannot just pick any tuple and expect it to work. Some versions of
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


#### Syntax of the environment script

The syntax to source the script is simple. Assuming the full path to
the script is `$HOME/alicesw/alice-env.sh`, you will do:

```bash
source $HOME/alicesw/alice-env.sh [-q] [-n [nTuple]|-m queryTuple] [-c] [-k] [-u]
```

As you can see, some optional switches are available (square braces
stand for "optional", you should not type them literally).

Two of them are used to select a tuple **non-interactively**, *e.g.* from inside
another script:

* `-n [nTuple]`: automatically loads tuple number `nTuple`, if this parameter is
  specified (*e.g.* `-n 12`). If you just specify `-n` without any number, loads
  the tuple number stored in the variable `$nAliTuple`, to be configured in the
  configuration file
* `-m queryTuple`: automatically loads the first tuple found that matches
  `queryTuple`, a string that follows the tuple format. This is better
  understood via a couple of examples:
  * To load the first tuple with AliRoot version *master* and ROOT version
    *v5-34-08*: `-m "aliroot=master root=v5-34-08"`
  * To load the first tuple with AliRoot *master*: `-m "aliroot=master"`

Setting environment via a query string has priority, so if both `-m` and `-n`
are specified, only `-m` is considered.

The script returns a verbose error in case it is impossible to find a matching
tuple.

Other parameters:

* `-q`: quiet mode. Useful if you source the script from `.bashrc` and
  you do not want to see the output every time you open a new shell
* `-c`: cleans environment from previously set ALICE variables without
  setting any tuple
* `-k`: do not check for updates of the environment script
* `-u`: force-update of the environment script

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

If you use Bash, the default shell on Ubuntu, Fedora and OS X, you can
simply append the following snippet to your `~/.bashrc` using your
favorite editor:

```bash
# Load environment variables by simply typing "ali"
alias ali='source $HOME/alicesw/alice-env.sh'
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
git remote update --prune origin
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

On **OS X** configure it with:

```bash
./configure \
  --with-pythia6-uscore=SINGLE \
  --with-alien-incdir=$GSHELL_ROOT/include \
  --with-alien-libdir=$GSHELL_ROOT/lib \
  --with-monalisa-incdir="$GSHELL_ROOT/include" \
  --with-monalisa-libdir="$GSHELL_ROOT/lib" \
  --with-xrootd=$GSHELL_ROOT \
  --enable-minuit2 \
  --enable-roofit \
  --enable-soversion \
  --disable-bonjour \
  --enable-builtin-freetype \
  --with-clang \
  --with-f77=$( which gfortran ) \
  --with-cc=$( which clang ) \
  --with-cxx=$( which clang++ ) \
  --with-ld=$( which clang++ )
  --disable-fink \
  --enable-cocoa
```

On **Linux (gcc)**:

```bash
./configure \
  --with-pythia6-uscore=SINGLE \
  --with-alien-incdir=$GSHELL_ROOT/include \
  --with-alien-libdir=$GSHELL_ROOT/lib \
  --with-monalisa-incdir="$GSHELL_ROOT/include" \
  --with-monalisa-libdir="$GSHELL_ROOT/lib" \
  --with-xrootd=$GSHELL_ROOT \
  --enable-minuit2 \
  --enable-roofit \
  --enable-soversion \
  --disable-bonjour \
  --enable-builtin-freetype \
  --with-f77=$( which gfortran ) \
  --with-cc=$( which gcc ) \
  --with-cxx=$( which g++ ) \
  --with-ld=$( which g++ )
```

On **Linux (clang)**:

```bash
./configure \
  --with-pythia6-uscore=SINGLE \
  --with-alien-incdir=$GSHELL_ROOT/include \
  --with-alien-libdir=$GSHELL_ROOT/lib \
  --with-monalisa-incdir="$GSHELL_ROOT/include" \
  --with-monalisa-libdir="$GSHELL_ROOT/lib" \
  --with-xrootd=$GSHELL_ROOT \
  --enable-minuit2 \
  --enable-roofit \
  --enable-soversion \
  --disable-bonjour \
  --enable-builtin-freetype \
  --with-clang \
  --with-f77=$( which gfortran ) \
  --with-cc=$( which clang ) \
  --with-cxx=$( which clang++ ) \
  --with-ld=$( which clang++ )
```

**Note:** you may need to use different `--enable-` or `--disable-`
switches to suit your needs: bear in mind that enabling some switches
is likely to require external packages not mentioned in this guide.

After configuring it, make sure that the list of "enabled features"
contains **opengl**. You can quickly check with:

```console
$> root-config --features | grep -q opengl && echo OK
OK
```

If `OK` is displayed, then you are good to go for building it:

```bash
make -j$MJ
```

**Very important!** When you're done compiling ROOT, you must source
**again** the environment script before you can use it!


### Geant 3

> Geant 3 has been moved from SVN to Git. One practical implication:
> *trunk* does not exist anymore, use *master* instead.

First off, **load your environment variables**.

The first time you install Geant 3 you need to create the local Git
clone. Do:

```bash
mkdir -p "$ALICE_PREFIX/geant3/git"
cd "$ALICE_PREFIX/geant3/git"
git clone http://root.cern.ch/git/geant3.git .
```

If you have already created the Geant 3 clone, immediately skip to the
next step.

Update your Git clone:

```bash
cd "$ALICE_PREFIX/geant3/git"
git remote update --prune
```

Checkout your desired version (you need `git-new-workdir` for that):

```bash
git-new-workdir "$ALICE_PREFIX/geant3/git" "$GEANT3DIR" "$G3_VER"
```

Move to it and build:

```bash
cd "$GEANT3DIR"
make -j$MJ
```

Once again, **you need to re-source `alice-env.sh`** for using Geant 3
and before building AliRoot.


### FastJet and FastJet contrib (optional)

You can optionally add a `fastjet=` and `fjcontrib=` element in your
software tuple definition if you want to install also
[FastJet](http://fastjet.fr/) and
[FastJet contrib](http://fastjet.hepforge.org/contrib/).

> FastJet 2 is no longer supported. **FastJet contrib is mandatory** if you want
> to use FastJet.

For using FastJet make your tuple look similar to this one:

```bash
AliTuple[1]='root=v5-34-08 geant3=v1-15a \
             aliroot=master aliphysics=master \
             fastjet=3.0.6 fjcontrib=1.012'
```

Source the `alice-env.sh` script. Then, create the FastJet source directory and
move into it:

```bash
mkdir -p "$FASTJET"/src
cd "$FASTJET"/src
```

Download the tarball corresponding to the desired FastJet version:

```bash
curl -Lo source.tar.gz http://fastjet.fr/repo/fastjet-"$FASTJET_VER".tar.gz
```

Download the tarball corresponding to the desired FastJet contrib version:

```bash
curl -Lo contrib.tar.gz http://fastjet.hepforge.org/contrib/downloads/fjcontrib-"$FJCONTRIB_VER".tar.gz
```

Unpack both tarballs:

```bash
tar xzf source.tar.gz
tar xzf contrib.tar.gz
```

Now, move to the FastJet source directory:

```bash
cd "$FASTJET/src/fastjet-$FASTJET_VER"
```

When you are done patching, configure FastJet by copying and pasting the lines
below.

On **OS X**:

```bash
export CXXFLAGS='-lgmp'
export CXX=$(which clang++)
./configure --enable-cgal --prefix="$FASTJET"
```

On **Linux (gcc)**:

```bash
export CXXFLAGS='-Wl,--no-as-needed -lgmp'
export CXX=$(which g++)
./configure --enable-cgal --prefix="$FASTJET"
```

On **Linux (clang)**:

```bash
export CXXFLAGS='-Wl,--no-as-needed -lgmp'
export CXX=$(which clang++)
./configure --enable-cgal --prefix="$FASTJET"
```

Note that **enabling CGAL is optional**. Also note that there are two `CXX*`
variables in the environment: **we will need them later** for FastJet contrib.

If the configuration succeeded, compile FastJet with the usual command:

```bash
make -j$MJ install
```

For installing FastJet contrib, **source the environment variables once again**,
then move to the contrib source directory:

```bash
cd "$FASTJET/src/fjcontrib-$FJCONTRIB_VER"
```

Now configure, build and install it:

```bash
./configure CXX="$CXX" CXXFLAGS="$CXXFLAGS"
make -j$MJ && make install
make -j$MJ fragile-shared && make fragile-shared-install
```

**Important!** You **must** clean up the `CXX*` variables now:

```bash
unset CXX CXXFLAGS
```


### AliRoot

#### AliRoot and Git

[Git](http://git-scm.com) is a popular Distributed Version Control
System used by many important projects, notably the
[Linux Kernel](https://git.kernel.org): both Git and the Linux Kernel
were in fact conceived by
[the same person](http://en.wikipedia.org/wiki/Linus_Torvalds).

AliRoot is now available on Git to allow for a more agile development
paradigm.

> New to Git? Check out [our ALICE Git tutorial](../../git)!


#### Source, build and installation directory

For compatibility reasons with software running on the Grid, a single
environment variable, `$ALICE_ROOT`, is exported, and it points to the AliRoot
Core installation directory.

In total we have three directories needed for AliRoot:

* as said already, `$ALICE_ROOT` is the **installation directory**: this is
  where AliRoot binaries and other needed files end up after performing `make
  install`;
* **source code** is available under the `$ALICE_ROOT/../src` directory: this is
  the place where all Git operations (*e.g.* `git pull --rebase`,
  `git checkout`) occur;
* there is a third *temporary* directory, the **build directory**, where
  temporary object files are stored: this is accessible under
  `$ALICE_ROOT/../build`, it is only used during compilation and it does not
  contain any important file for running AliRoot. The `make install` command is
  issued from there.

> The meaning of `$ALICE_ROOT` has changed on Dec 2014 and has been made
> compatible with the Grid: [more info here](/2014/12/16/alice-root-var).


#### Clone and configure your Git repository

First of all you should create a Git clone of the remote AliRoot
repository: for simplicity, consider it as a place containing all the
AliRoot versions ever made. This operation must be done **only once
for all**:

```bash
[ ! -d "$ALICE_PREFIX"/aliroot/git ] && git clone http://git.cern.ch/pub/AliRoot "$ALICE_PREFIX"/aliroot/git
```

You also need to set your Git username and email; plus, if you want, for
your convenience you can enable colors in Git output:

```bash
cd "$ALICE_PREFIX"/aliroot/git
git config user.name "your_cern_username"
git config user.email "your.email@cern.ch"
git config color.ui true
git config push.default simple
```

> Set your `user.name` to match your CERN username: your commits will
> be refused when pushing if you do not set it correctly.

Update the list of remote branches and tags:

```bash
cd "$ALICE_PREFIX"/aliroot/git
git remote update --prune origin
```

Create a Git source directory based on the local Git clone, using the
[git-new-workdir](https://raw.github.com/gerrywastaken/git-new-workdir/master/git-new-workdir)
utility (which must be in your `$PATH`):

```bash
git-new-workdir "${ALICE_PREFIX}/aliroot/git" "$(dirname "$ALICE_ROOT")/src" "$ALICE_VER"
```

As for ROOT, the old SVN *trunk* is now called the *master* branch.

**Please note** that AliRoot's Git repository has **two different
URLs**: pick one of them depending whether you have push rights
(*i.e.* you are allowed to publish your commits) or not.

Here are the URLs:

* Use this if **you can push:** `https://git.cern.ch/reps/AliRoot`
* Use this if **you cannot push:** `http://git.cern.ch/pub/AliRoot`

> You can change the URL without re-cloning. Do:
>
> ```bash
> cd "$(dirname "$ALICE_ROOT")/src"
> git remote set-url origin <appropriate_url>
> ```
>
> and watch out for `http` vs. `https`.

All the repositories created using `git-new-workdir` will
automatically use the new URL as the remote repository's URL.

> The cloning command above uses the **public URL**: do not run the
> `git remote set-url` command if you do not have push rights!


#### Configure and build AliRoot Core

Once you are done creating the local clone, create the build directory:

```bash
mkdir -p "$(dirname "$ALICE_ROOT")/build"
cd "$(dirname "$ALICE_ROOT")/build"
```

Now we configure AliRoot Core with CMake: we tell AliRoot to use the same
compilers used by ROOT, and we point it to the correct location of its
dependencies. This procedure has to be run only once.

On **OS X**:

```bash
cmake "$(dirname "$ALICE_ROOT")/src" \
  -DCMAKE_C_COMPILER=`root-config --cc` \
  -DCMAKE_CXX_COMPILER=`root-config --cxx` \
  -DCMAKE_Fortran_COMPILER=`root-config --f77` \
  -DCMAKE_INSTALL_PREFIX="$ALICE_ROOT" \
  -DALIEN="$ALIEN_DIR" \
  -DROOTSYS="$ROOTSYS" \
  -DFASTJET="$FASTJET"
```

On **Linux (gcc and clang)**:

```bash
cmake "$(dirname "$ALICE_ROOT")/src" \
  -DCMAKE_C_COMPILER=`root-config --cc` \
  -DCMAKE_CXX_COMPILER=`root-config --cxx` \
  -DCMAKE_Fortran_COMPILER=`root-config --f77` \
  -DCMAKE_MODULE_LINKER_FLAGS='-Wl,--no-as-needed' \
  -DCMAKE_SHARED_LINKER_FLAGS='-Wl,--no-as-needed' \
  -DCMAKE_EXE_LINKER_FLAGS='-Wl,--no-as-needed' \
  -DCMAKE_INSTALL_PREFIX="$ALICE_ROOT" \
  -DALIEN="$ALIEN_DIR" \
  -DROOTSYS="$ROOTSYS" \
  -DFASTJET="$FASTJET"
```

Omit `-DFASTJET` if you do not have FastJet.

After configuring, build it:

```bash
make -j$MJ
```

If you don't want to build in parallel, run `make` without any switches. CMake
provides you with a percentage of completion of your build.

When build has completed, remove any previous symlink of the `include` directory
from the source code: do that with:

```bash
[[ -L "$(dirname "$ALICE_ROOT")/src/include" ]] && rm -f "$(dirname "$ALICE_ROOT")/src/include"
```

The above command only removes it if necessary.

Now, perform the installation. Installation has to be done in two different ways
according to how recent is your AliRoot installation. If you copy and paste the
following long command, the correct method will be chosen automatically:

```bash
[[ -d "$(dirname "$ALICE_ROOT")/build/version" ]] && make install || ( rm -rf "$ALICE_ROOT" ; ln -nfs build "$ALICE_ROOT" )
```

You are now done and you can start using AliRoot right away.
