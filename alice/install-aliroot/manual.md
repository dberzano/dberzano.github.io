---
title: "Manual AliRoot installation"
layout: tweet

createtoc: true
parnumbers: true
deprecated_notice: 'As of May 2, 2016 this installation method is no longer supported: <a href="/alice/alibuild">get started with aliBuild</a> at your earliest convenience.'
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
> bash <(curl -fsSL http://alien.cern.ch/alice-installer) --bugreport
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

> It is possible to use pre-built packages for some components:
> [see here how](/2015/05/05/external-packages).

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

> Please note that **you must strip the build number when downloading sources**,
> but when you launch jobs **on the Grid you will need the full version,
> including the build number!**


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


#### Additional environment configuration

By default the `alice-env.sh` script adds to the shell prompt a message with the
current Git branch, if you are inside a Git directory. If you do not want it to
show up, add in your `alice-env.conf`:

```bash
ALICE_ENV_DONT_CHANGE_PS1=1
```


Get and build the software
--------------------------


### AliEn

First of all source the environment variables. Then, copy and paste
the following commands:

```bash
cd /tmp
bash <(curl -fSsL http://alien.cern.ch/alien-installer) -install-dir "$ALIEN_DIR" -batch -notorrent -type compile && alien-token-destroy
```

AliEn will be compiled for your system, and any token created with a previous
AliEn version will be destroyed (note that this is non-optional).

**In case you are using OS X** you need Autotools installed for this
step to work. If you have followed the [instructions](../prereq-osx)
then you already have them installed.

> **OS X El Capitan**, released on Oct 2015, sometimes strips some environment
> variables security reasons. Read on to know how this affects AliEn and how to
> make it work again.

**In case you are using OS X version 10.11 (El Capitan) or greater**, you need
a workaround to make AliEn libraries visible by other applications: they must be
linked to a system location. If you use Homebrew you already have user
permissions on `/usr/local`, so just do:

```bash
for L in $GSHELL_ROOT/lib/*.{dylib,so}; do ln -nfs $L /usr/local/lib; done
```


### ROOT

> As of Oct 5, 2015 we are supporting only ROOT versions patched by ALICE and
> not the upstream ones. Read on for information.

ALICE-patched ROOT releases are [available on
GitHub](https://github.com/alisw/root): our patching policy allows us to apply
custom patches and backport minor fixes to earlier ROOT versions.

We currently patch the following ROOT releases:

| ROOT version | Our custom Git branch |      |
| ------------ | --------------------- | ---- |
| v5-34-08     | alice/v5-34-08        | [diff](https://github.com/alisw/root/compare/v5-34-08...alisw:alice/v5-34-08) |
| v5-34-30     | alice/v5-34-30        | [diff](https://github.com/alisw/root/compare/v5-34-30...alisw:alice/v5-34-30) |

This means that, for instance, you have to specify **our custom Git branch** in
your tuple, like this:

```bash
AliTuple[1]="root=alice/v5-34-30
             geant3=v2-0 \
             aliroot=master
             aliphysics=master"
```

Note the `alice/` prefix in front of the version name.


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
git clone https://github.com/alisw/root.git .
```

The last command is expected to take some time.


#### Select your ROOT version, stage it and compile it

Your environment variables must be sourced. Move to the Git clone directory and
update the list of remote branches:

```bash
cd "$ALICE_PREFIX/root/git"
git remote update --prune origin
```

> **Stop! (Mar 29, 2015):** The new installation procedure for ROOT requires a
> source, build and installation directory
> ([read here](/2015/03/29/new-g3-root-fj-install)).
>
> If you are too lazy to read, this command will do the right thing:
>
> ```bash
> [[ -f "$ALICE_PREFIX/root/$ROOT_SUBDIR/LICENSE" ]] && rm -rf "$ALICE_PREFIX/root/$ROOT_SUBDIR"
> ```

If you have already created a Git working directory for your desired branch,
jump to the next step. If not, do it:

```bash
mkdir -p "$ALICE_PREFIX/root/$ROOT_SUBDIR"
git-new-workdir "$ALICE_PREFIX/root/git/" "$ALICE_PREFIX/root/$ROOT_SUBDIR/src/" "$ROOT_VER"
```

If your ROOT version is either a `master` or a development branch (such as
`v5-34-00-patches`), update it:

```bash
cd "$ALICE_PREFIX/root/$ROOT_SUBDIR/src/"
git pull --rebase
```

This obviously does not apply to tagged versions (such as `v5-34-26`). In case
you accidentally execute the command for a "non-updatable" version, the command
will fail without any consequences.

Create now the build directory, and move to it (we will build out of source,
*i.e.* not in the source directory):

```bash
mkdir -p "$ALICE_PREFIX/root/$ROOT_SUBDIR/build/"
cd "$ALICE_PREFIX/root/$ROOT_SUBDIR/build/"
```

The following step is very important, because it is the place where you
customize your own ROOT installation based on your needs: Geant 3 and AliRoot
will rely on ROOT's configuration to compile.

Configuration options depend on your operating system and desired compiler.

On **OS X** configure it with:

```bash
"$ALICE_PREFIX/root/$ROOT_SUBDIR/src/configure" \
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
  --disable-rfio \
  --disable-castor \
  --enable-builtin-ftgl \
  --enable-builtin-freetype \
  --with-clang \
  --with-f77=$( which gfortran ) \
  --with-cc=$( which clang ) \
  --with-cxx=$( which clang++ ) \
  --with-ld=$( which clang++ ) \
  --disable-fink \
  --enable-cocoa \
  --prefix="$ROOTSYS" \
  --incdir="$ROOTSYS/include" \
  --libdir="$ROOTSYS/lib" \
  --datadir="$ROOTSYS" \
  --etcdir="$ROOTSYS/etc"
```

On **Linux (gcc)**:

```bash
"$ALICE_PREFIX/root/$ROOT_SUBDIR/src/configure" \
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
  --enable-builtin-ftgl \
  --enable-builtin-freetype \
  --with-f77=$( which gfortran ) \
  --with-cc=$( which gcc ) \
  --with-cxx=$( which g++ ) \
  --with-ld=$( which g++ ) \
  --prefix="$ROOTSYS" \
  --incdir="$ROOTSYS/include" \
  --libdir="$ROOTSYS/lib" \
  --datadir="$ROOTSYS" \
  --etcdir="$ROOTSYS/etc"
```

On **Linux (clang)**:

```bash
"$ALICE_PREFIX/root/$ROOT_SUBDIR/src/configure" \
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
  --enable-builtin-ftgl \
  --enable-builtin-freetype \
  --with-clang \
  --with-f77=$( which gfortran ) \
  --with-cc=$( which clang ) \
  --with-cxx=$( which clang++ ) \
  --with-ld=$( which clang++ ) \
  --prefix="$ROOTSYS" \
  --incdir="$ROOTSYS/include" \
  --libdir="$ROOTSYS/lib" \
  --datadir="$ROOTSYS" \
  --etcdir="$ROOTSYS/etc"
```

**Note:** you may need to use different `--enable-` or `--disable-` switches to
suit your needs: bear in mind that enabling some switches will likely require
additional external packages not mentioned in this guide.

After configuring it, make sure that the list of "enabled features" contains
**opengl** and **alien**. You can quickly check with:

```console
$> bin/root-config --features | grep -q opengl && echo OK
OK
$> bin/root-config --features | grep -q alien && echo OK
OK
```

If `OK` is displayed in both cases, proceed with the build:

```bash
make -j$MJ OPT='-O2 -g'
```

With the above command, ROOT will be built with a "standard" optimization level
(`-O2`) and debug symbols (`-g`). We recommend using the following options
according to the "build type" you desire:

* `OPT='-O2 -g'` *(default)*: ordinary use; gives mostly complete stacktraces
  and decent running speed
* `OPT='-O0 -g'`: **debug mode**: no optimization and debug symbols; stacktraces
  are not optimized out, but running speed is slower
* `OPT='-O3'`: **optimized mode**: no debug information, and "high" level of
  compile-time optimization

Now clean the old installation directory and install ROOT:

```bash
rm -rf "$ROOTSYS"
make -j$MJ install
```


### Geant 3 (optional)

The Geant 3 package is optional: if you do not want to install it, do not
specify a `geant3=` entry in the tuple, and skip this section.

If you want to install it, **load your environment variables** first.

The first time you install Geant 3 you need to create the local Git clone. Do:

```bash
mkdir -p "$ALICE_PREFIX/geant3/git"
cd "$ALICE_PREFIX/geant3/git"
git clone http://root.cern.ch/git/geant3.git .
```

If you have already created the Geant 3 clone, skip this command and jump to the
next step.

Update your Git clone:

```bash
cd "$ALICE_PREFIX/geant3/git"
git remote update --prune
```

> **Stop! (Mar 29, 2015):** Geant 3 v2-0 uses CMake and it requires a source,
> build and installation directory
> ([read here](/2015/03/29/new-g3-root-fj-install)).
>
> If you are too lazy to read, this command will do the right thing:
>
> ```bash
> [[ -f "$ALICE_PREFIX/geant3/$G3_SUBDIR/README" ]] && rm -rf "$ALICE_PREFIX/geant3/$G3_SUBDIR"
> ```

Checkout your desired version (you need `git-new-workdir` for that):

```bash
git-new-workdir "$ALICE_PREFIX/geant3/git" "$ALICE_PREFIX/geant3/$G3_SUBDIR/src" "$G3_VER"
```

The rest of the installation process differs whether you are using Geant 3 v2-0
or a less recent version.


#### Geant 3 < v2-0 (no CMake)

**If you are using Geant 3 < v2-0** there is no CMake there. Copy your source to
the build directory:

```bash
rsync -cva "$ALICE_PREFIX/geant3/$G3_SUBDIR/src/" "$ALICE_PREFIX/geant3/$G3_SUBDIR/build/"
```

> Trailing slashes are **fundamental** for rsync! **Do not omit them!**

Move to the build directory and compile:

```bash
cd "$ALICE_PREFIX/geant3/$G3_SUBDIR/build/"
make -j$MJ
```

When done, run the following commands to copy the important files to the
installation directory (there is no `make install` there):

```bash
rm -rf "$ALICE_PREFIX/geant3/$G3_SUBDIR/inst/"
mkdir -p "$ALICE_PREFIX/geant3/$G3_SUBDIR/inst/include/TGeant3/"
cp -v "$ALICE_PREFIX/geant3/$G3_SUBDIR/build/TGeant3/"*.h "$ALICE_PREFIX/geant3/$G3_SUBDIR/inst/include/TGeant3/"
rsync -av "$ALICE_PREFIX/geant3/$G3_SUBDIR/build/lib/tgt_$(root-config --arch)/" "$ALICE_PREFIX/geant3/$G3_SUBDIR/inst/lib/"
```


#### Geant 3 >= v2.0 (with CMake)

**If you are using at least Geant 3 v2-0** the build process is steered by
CMake.

Create the build directory:

```bash
mkdir -p "$ALICE_PREFIX/geant3/$G3_SUBDIR/build"
```

Move to it and run CMake:

```bash
cd "$ALICE_PREFIX/geant3/$G3_SUBDIR/build/"
cmake "$ALICE_PREFIX/geant3/$G3_SUBDIR/src/" -DCMAKE_INSTALL_PREFIX="$ALICE_PREFIX/geant3/$G3_SUBDIR/inst/"
```

Build Geant 3:

```bash
make -j$MJ
```

Install it (by cleaning the old installation first):

```bash
rm -rf "$ALICE_PREFIX/geant3/$G3_SUBDIR/inst/"
make -j$MJ install
```


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

> **Stop! (Mar 29, 2015):** The new installation procedure for FastJet requires
> a source, build and installation directory
> ([read here](/2015/03/29/new-g3-root-fj-install)).
>
> If you are too lazy to read, this command will do the right thing:
>
> ```bash
> rm -rf "$ALICE_PREFIX/fastjet/$FASTJET_VER/"{bin,include,lib}
> ```


Now, move to the FastJet source directory:

```bash
cd "$FASTJET/src/fastjet-$FASTJET_VER"
```

When you are done patching, configure FastJet by copying and pasting the lines
below.

On **OS X**:

```bash
export CXXFLAGS='-lgmp -lCGAL -O2 -g'
export CXX=$(which clang++)
./configure --enable-cgal --prefix="$FASTJET"
```

On **Linux (gcc)**:

```bash
export CXXFLAGS='-Wl,--no-as-needed -lgmp -lCGAL -O2 -g'
export CXX=$(which g++)
./configure --enable-cgal --prefix="$FASTJET"
```

On **Linux (clang)**:

```bash
export CXXFLAGS='-Wl,--no-as-needed -lgmp -lCGAL -O2 -g'
export CXX=$(which clang++)
./configure --enable-cgal --prefix="$FASTJET"
```

Enabling CGAL is optional but strongly recommended. Also note that there are two
`CXX*` variables in the environment: **we will need them later** for FastJet
contrib too.

Please note also that you can use optimization and debug switches different than
`-O2 -g`. If you are unsure, leave them like this. If you know what you are
doing, here are the suggested alternative combinations:

* for **debugging**, use `-O0 -g`: optimization is turned off and you have debug
  symbols, so you are sure that nothing gets optimized out and stack traces are
  complete
* for **optimization**, use `-O3`: a higher level of compile-time optimization
  is enabled and no debug symbols are generated; FastJet will run faster, but
  one of the consequences is that stack traces will not be complete

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


### AliRoot Core

> As of **Jan 20, 2015** AliRoot has been split into AliRoot Core and
> AliPhysics. If you want to use tags prior to that date (*i.e.* before
> **vAN-20150120**), you can:
> [read here how](/2015/01/20/aliroot-split-update/#using_aliroot_tags_before_the_split).


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

**If you are cloning the selected version of AliRoot Core for the first time**,
use [git-new-workdir](https://raw.github.com/gerrywastaken/git-new-workdir/master/git-new-workdir)
(which must be in your `$PATH`):

```bash
git-new-workdir "${ALICE_PREFIX}/aliroot/git" "$(dirname "$ALICE_ROOT")/src" "$ALICE_VER"
```

**If you are updating or upgrading an already downloaded version of AliRoot
Core** (for instance, you want to update your *master*), move to the source
directory and pull:

```bash
cd "$(dirname "$ALICE_ROOT")/src"
git pull --rebase origin "$ALICE_VER"
```

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
  -DCMAKE_BUILD_TYPE=RELWITHDEBINFO \
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
  -DCMAKE_BUILD_TYPE=RELWITHDEBINFO \
  -DFASTJET="$FASTJET"
```

Omit `-DFASTJET` if you do not have FastJet.

The `-DCMAKE_BUILD_TYPE` tells CMake how to build AliRoot Core. The most common
values are:

* **RELWITHDEBINFO** *(default if omitted)*: build with some optimization on
  (`-O2`) and debug symbols on (`-g`)
* **DEBUG**: build with no optimization (`-O0`) and debug symbols (`-g`)
* **RELEASE**: build with a high level of optimization (`-O3`) and no debug
  symbol

If you don't know what this is about, just accept the default value
(**RELWITHDEBINFO**).

Please note that the values are **case-sensitive** (*i.e.* **Debug** is
different than **DEBUG**).

> If you want to rebuild an existing AliRoot with different build options,
> **remove the build directory** and start from scratch!

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


### AliPhysics

> As of **Jan 20, 2015** AliRoot has been split into AliRoot Core and
> AliPhysics. You do not need AliPhysics for versions prior to **vAN-20150120**:
> [find the details here](/2015/01/20/aliroot-split-update/#using_aliroot_tags_before_the_split).

AliPhysics is the ALICE software package for user analysis and it depends on
[AliRoot Core](#aliroot_core).

AliPhysics is, like AliRoot, available from a Git repository. Installation
instructions are very similar to AliRoot's: should you need more details you
might want to look at the [AliRoot Core installation procedure](#aliroot_core).

First off, **make a local clone of AliPhysics**; note that this operation has to
be performed **only once for all**:

```bash
[[ ! -d "$ALICE_PREFIX"/aliphysics/git ]] && git clone http://git.cern.ch/pub/AliPhysics "$ALICE_PREFIX"/aliphysics/git
```

Now configure it (just like AliRoot Core) with your **CERN username** and your
**real email**:

```bash
cd "$ALICE_PREFIX"/aliphysics/git
git config user.name "your_cern_username"
git config user.email "your.email@cern.ch"
git config color.ui true
git config push.default simple
```

Update the list of remote branches and tags (this is **important**):

```bash
cd "$ALICE_PREFIX"/aliphysics/git
git remote update --prune origin
```

**If you are cloning the selected version of AliPhysics for the first time**,
use [git-new-workdir](https://raw.github.com/gerrywastaken/git-new-workdir/master/git-new-workdir)
(which must be in your `$PATH`):

```bash
git-new-workdir "${ALICE_PREFIX}/aliphysics/git" "$(dirname "$ALICE_PHYSICS")/src" "$ALIPHYSICS_VER"
```

**If you are updating or upgrading an already downloaded version of AliPhysics**
(for instance, you want to update your *master*), move to the source directory
and pull:

```bash
cd "$(dirname "$ALICE_PHYSICS")/src"
git pull --rebase origin "$ALIPHYSICS_VER"
```

As for AliRoot Core, AliPhysics has two different Git URLs:

* Use this if **you can push:** `https://git.cern.ch/reps/AliPhysics`
* Use this if **you cannot push:** `http://git.cern.ch/pub/AliPhysics`

Change the default URL with:

```bash
cd "$(dirname "$ALICE_PHYSICS")/src"
git remote set-url origin <appropriate_url>
```

URL changes are propagated to all repositories created with `git-new-workdir`,
*i.e.* you do not need to run the `remote set-url` command on each AliPhysics
repository you created.

Create the temporary **build directory**:

```bash
mkdir -p "$(dirname "$ALICE_PHYSICS")/build"
cd "$(dirname "$ALICE_PHYSICS")/build"
```

Configure your build using CMake:

```bash
cmake "$(dirname "$ALICE_PHYSICS")/src" \
  -DCMAKE_INSTALL_PREFIX="$ALICE_PHYSICS" \
  -DCMAKE_C_COMPILER=`root-config --cc` \
  -DCMAKE_CXX_COMPILER=`root-config --cxx` \
  -DCMAKE_Fortran_COMPILER=`root-config --f77` \
  -DALIEN="$ALIEN_DIR" \
  -DROOTSYS="$ROOTSYS" \
  -DFASTJET="$FASTJET" \
  -DALIROOT="$ALICE_ROOT" \
  -DCMAKE_BUILD_TYPE=RELWITHDEBINFO
```

You might omit the `-DFASTJET` switch if you don't have FastJet. With this
command, you are compiling AliPhysics against the version of AliRoot Core
installed under `$ALICE_ROOT`.

Concerning the `-DCMAKE_BUILD_TYPE` option, leave it like this if you don't know
what this is about. If you need special build options, have a look at the
[explanation](#configure_and_build_aliroot_core) for AliRoot Core, which applies
to AliPhysics as well.

> AliRoot Core is installed under `$ALICE_ROOT`, while AliPhysics uses
> `$ALICE_PHYSICS`. Variables are set both locally and on the Grid.

Please note that the **CMake step** has to be performed **only once**: when the
software is configured, unless you have changed AliRoot, FastJet or ROOT, you
can test your code by compiling and installing as explained below.

To compile your code and get it in the installation directory (which is, it's
worth to remind it, `$ALICE_PHYSICS`), simply do:

```bash
cd "$(dirname "$ALICE_PHYSICS")/build"
make -j$MJ install
```

Do not forget to run `make install` and not just plain `make`.

Now you are ready to use the full chain of the ALICE software.


#### Build to test your local changes

Normally you would use AliPhysics to develop and continuously test your changes
locally.

The standard workflow is the following. After you build and install AliPhysics
for the first time, go in the **source** directory to develop your code:

```bash
cd "${ALICE_PHYSICS}/../src"
# develop develop develop
```

Then move to the build directory, compile and install:

```bash
cd "${ALICE_PHYSICS}/../build"
make -j$MJ install
```

If this step succeeds, it does not necessarily imply that your AliPhysics
installation will work: in fact library loading might break at runtime. To test
if library loading works in one go, run, **from the build directory**:

```bash
ctest --output-on-failure && echo All tests OK
```

You will see the message *All tests OK* only if all tests pass. If some library
won't load, an extended output will tell you what went wrong.

> If you have errors related to FastJet or CGAL, it is probably not your fault:
> clean your FastJet installation and
> [rebuild it from scratch](#fastjet_and_fastjet_contrib_(optional)), then run
> the tests again.

Errors in loading libraries (missing symbols, missing dependencies, etc.)
usually boil down to one of the following scenarios:

* You have just added a class, but you have forgotten to add it to the
  `LinkDef.h`.
* You have just added a class to a library requiring another library, but you
  have forgotten to add the dependency to the `CMakeLists.txt` (it is normally
  in a variable called `LIBDEPS`).

> **Do not push if tests fail!** Contact an expert if you don't understand the
> error. Daily tags are skipped upon failed tests!

Credits for adding the library loading test suite go to **Jochen Klein**!

After `make install` all the relevant files will be under `$ALICE_PHYSICS`,
*i.e.* the installation directory.

> There is no need to re-run CMake for development, just run `make install` in
> the build directory.

When writing your code, keep in mind the following things when referring to
directories:

 * `$ALICE_ROOT` is the installation directory of AliRoot Core
 * `$ALICE_PHYSICS` is the installation directory of AliPhysics
 * both variables are set in your current local environment, and also on the
   Grid: if you write code that uses them **it will work seamlessly locally and
   on the Grid**
 * **never refer for any reason to source files**: *i.e.*, do not put
   references to things like `$ALICE_PHYSICS/../src/blahblah`: source is only
   available on your computer, and it increases exponentially the chances of
   your code failing on the Grid
 * if you want to refer to some source files (*e.g.* load macros), the correct
   way to proceed is to modify the `CMakeLists.txt` in your working directory
   (there's one of those files per directory) and tell it to **install** the
   relevant files: this way, `make install` will copy them under
   `$ALICE_PHYSICS`

> How to get your files to the installation directory is explained [in an
> earlier post](/2014/12/16/alice-root-var/).
