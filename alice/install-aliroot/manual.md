---
title: "Manual AliRoot installation"
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

> When requesting support, please **always** attach the output file
> produced by the following command:
>
> ```bash
> bash <(curl -fsSL http://cern.ch/go/NcS7) --bugreport
> ```
>
> Note that you **must** run this command from the same directory
> containing the `alice-env.sh` script in use.


Prepare your environment
------------------------


### System-wise prerequisites

Supported operating systems have different prerequisites:

* [Ubuntu](../prereq-ubuntu) *(and derivatives)*
* [OS X](../prereq-osx)

You can find [here](..#compile_aliroot_from_source) the detailed list
of compatible operating systems.

> If your operating system (with version) is not listed explicitly,
> **no support will be provided for it**.


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
# Triads in the form "ROOT Geant3 AliRoot [FastJet[_FJContrib]]". Indices
# start from 1 not 0. The FastJet entry is optional, and so is FJContrib.
# More information: http://aliceinfo.cern.ch/Offline/AliRoot/Releases.html
TRIAD[1]="v5-34-11 v1-15a master" # no FastJet
TRIAD[2]="v5-34-11 v1-15a master 2.4.5" # with FastJet
TRIAD[3]="v5-34-18 v1-15a master 3.0.6_1.012" # with FastJet and FJ contrib
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

Create the directory that will contain several Geant 3 versions, then
cd into it and checkout the version you selected in the triad via
Subversion:

```bash
mkdir -p "$GEANT3DIR"
cd "$GEANT3DIR"
svn co https://root.cern.ch/svn/geant3/$([ $G3_VER == 'trunk' ] || echo tags/)$G3_VER .
```

When you are done, compile it:

```bash
make -j$MJ
```

Once again, **you need to re-source `alice-env.sh`** for using Geant 3
and before building AliRoot.


### FastJet and FastJet contrib (optional)

You can define a fourth element in the triad corresponding to the
[FastJet](http://fastjet.fr/) version you would like to use. If you
wish, you can also include a
[FastJet contrib](http://fastjet.hepforge.org/contrib/) package of
your choice.

**Compiling FastJet is optional, and FastJet contrib are not required
to use FastJet.**

If you want to use FastJet only (no contrib), you can specify a fourth
element to the "triad" like this:

```bash
TRIAD[1]="<root> v1-15a master 3.0.6" # with FastJet only
```

If you want FastJet contrib as well, specify its version after the
FastJet version, separated with an underscore:

```bash
TRIAD[1]="<root> v1-15a master 3.0.6_1.012" # with FastJet and FJ contrib
```

Source the `alice-env.sh` script. Then, create the FastJet source
directory and move into it:

```bash
mkdir -p "$FASTJET"/src
cd "$FASTJET"/src
```

Download the tarball corresponding to the desired FastJet version:

```bash
curl -Lo source.tar.gz http://fastjet.fr/repo/fastjet-"$FASTJET_VER".tar.gz
```

Download the tarball corresponding to the desired FastJet contrib
version:

```bash
curl -Lo contrib.tar.gz http://fastjet.hepforge.org/contrib/downloads/fjcontrib-"$FJCONTRIB_VER".tar.gz
```

Unpack FastJet and the optional contrib:

```bash
tar xzf source.tar.gz
tar xzf contrib.tar.gz
```

FastJet code and contrib (all versions) need to be patched in order
to make CINT understand the `fastjet` namespace. Copy and paste the
following snippet with confidence:

```bash
find . -name '*.h' -or -name '*.hh' -or -name '*.cc' -or -name '*.icc' | \
  while read F; do
    sed -e 's|^FASTJET_BEGIN_NAMESPACE.*|namespace fastjet {|' \
        -e 's|^FASTJET_END_NAMESPACE.*|} // end "fastjet" namespace|' \
        -e 's|^#define FASTJET_BEGIN_NAMESPACE.*||' \
        -e 's|^#define FASTJET_END_NAMESPACE.*||' \
        "$F" > "$F.0" && mv "$F.0" "$F"
  done
```

> **OS X with FastJet 2:** you need to apply an additional "patch"
> to make it compile correctly. Copy and paste the following:
>
> ```bash
> find . -name '*.h' -or -name '*.hh' | \
>   while read F; do
>     echo '#include <cstdlib>' > "$F.0" && \
>       cat "$F" | grep -v '#include <cstdlib>' >> "$F.0" && \
>       mv "$F.0" "$F"
>   done
> ```
>
> **No patch** is needed for FastJet 3 *(from v3.0.6)*.

Now, move to the FastJet source directory:

```bash
cd "$FASTJET/src/fastjet-$FASTJET_VER"
```

When you are done patching, configure FastJet by copying and pasting
the lines below.

On **OS X**:

```bash
( CXXFLAGS='-lgmp' ./configure --enable-cgal --prefix="$FASTJET" )
```

On **Ubuntu**:

```bash
( CXXFLAGS='-Wl,--no-as-needed -lgmp' ./configure --enable-cgal --prefix="$FASTJET" )
```

Note that **enabling CGAL is optional**.

If the configuration succeeded, compile FastJet with the usual
command:

```bash
make -j$MJ install
```

For installing FastJet contrib, **source the environment variables
once again**, then move to the contrib source directory:

```bash
cd "$FASTJET/src/fjcontrib-$FJCONTRIB_VER"
```

Now configure, build and install it:

```bash
./configure && make -j"$MJ" install
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

There is a [guide](http://aliceinfo.cern.ch/Offline/node/2912)
covering the migration from SVN to Git in detail: as a reference, the
method used in this wiki is the **git-new-workdir method**.
described in that documentation. This is the one I recommend, but
feel free to use the one you prefer.

New to Git? Before fearing or (worse) hating it, bear in mind that:

* there is **no actual equivalent between SVN and Git**: they are
  based on two completely different paradigms; trying to make
  comparisons is misleading and dangerous;
* once again, **Git is no SVN and it is no evolution of SVN**: SVN is
  a Version Control System, while Git is a *Distributed* VCS;
* Git and SVN have **different paradigms and workflows**, so it's
  better to forget about SVN when learning Git;
* the [ALICE documentation](http://aliceinfo.cern.ch/Offline/node/2912)
  maintains a list of useful resources concerning Git.

In any case, if you do not need to develop code for AliRoot, just
follow carefully this guide and you will be (mostly) safe.


#### Source and build directories

The suggested setup uses two directories, stored in two corresponding
environment variables:

* the `$ALICE_ROOT` variable points to the source code directory: all
  Git operations (like `git pull –rebase` or `git checkout`) shall
  occur here;
* the `$ALICE_BUILD` variable points to the build directory: this is
  where the results from compilation will be stored, and where `make`
  is performed.


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
git-new-workdir "$ALICE_PREFIX"/aliroot/git "$ALICE_ROOT" "$ALICE_VER"
```

As for ROOT, the old SVN *trunk* is now called the *master* branch.

The clone URL will not work if you need to **push (*i.e.*, publish)
your commits**: if you need to do it, execute:

```bash
cd "$ALICE_ROOT"
git remote set-url origin https://git.cern.ch/reps/AliRoot
```

All the repositories created using `git-new-workdir` will
automatically use the new URL as the remote repository's URL.

> Use this method only if you have access rights: you will be asked
> for your CERN username and password for doing every operation.



#### Configure and build AliRoot

Once you are done creating the local clone, create the build
directory (whose name is stored in the `$ALICE_BUILD` variable):

```bash
mkdir -p "$ALICE_BUILD"
cd "$ALICE_BUILD"
```

Now, tell CMake to get the source files from the proper directories
and to use the same compilers configured with ROOT: this procedure
has to be run only once.

On **OS X**:

```bash
cmake "$ALICE_ROOT" \
  -DCMAKE_C_COMPILER=`root-config --cc` \
  -DCMAKE_CXX_COMPILER=`root-config --cxx` \
  -DCMAKE_Fortran_COMPILER=`root-config --f77`
```

On **Ubuntu**:

```bash
cmake "$ALICE_ROOT" \
  -DCMAKE_C_COMPILER=`root-config --cc` \
  -DCMAKE_CXX_COMPILER=`root-config --cxx` \
  -DCMAKE_Fortran_COMPILER=`root-config --f77` \
  -DCMAKE_MODULE_LINKER_FLAGS='-Wl,--no-as-needed' \
  -DCMAKE_SHARED_LINKER_FLAGS='-Wl,--no-as-needed' \
  -DCMAKE_EXE_LINKER_FLAGS='-Wl,--no-as-needed'
```

After configuring, build it:

```bash
make -j$MJ
```

If you don't want to build in parallel, run `make` without any
switches. CMake provides you with a percentage of completion of your
build.

If the build is successful, do:

```bash
ln -nfs "$ALICE_BUILD"/include "$ALICE_ROOT"/include
```

This is needed because header files are now copied inside
`$ALICE_BUILD/include`, yet some analysis macros still search for them
inside `$ALICE_ROOT/include`.

When you are finished you can finally start using AliRoot.

























