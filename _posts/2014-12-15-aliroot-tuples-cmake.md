---
title: "New AliRoot build system and environment"
createtoc: true
---

As anticipated during the last ALICE Offline Week, the AliRoot Git
repository will soon be split in two distinct Git repositories:

* AliRoot Core
* AliPhysics (mostly user's code and analysis with daily tags)

In order to accommodate such forthcoming changes, the environment script and its
relative automatic installation script have been slightly updated.

The two major changes are:

* syntax updated from "triads" to "tuples"
* AliRoot installation requires `make install`

Practical details follow.


### Quickstart: automatic procedure

[Installation instructions](/alice/install-aliroot) have been updated to take
into account the split: just follow them closely and you will be fine.

> **TL;DR:** alice-env.sh has a new config format: it self-updates automatically
> and updates the config file accordingly. Install everything with the
> [automatic installer](/alice/install-aliroot/auto) and you will be OK.

If you are using an AliRoot tagged release (release or analysis tag), you can
continue using it with the new alice-env.sh

If you are using the master, and all the new tags created from now on, you will
need to recompile it from scratch according to the
[updated instructions](/alice/install-aliroot).

The same [instructions](/alice/install-aliroot) and the
[automatic installation](/alice/install-aliroot/auto) also retain all the
necessary information to build legacy AliRoot versions.


### From triads to tuples: new configuration format

The configuration file format where you define the former "triads" has changed
to accommodate software "tuples" instead. In practice what used to be:

```bash
TRIAD[1]='v5-34-22 v1-15b master 3.0.6_1.012'
```

has now become:

```bash
AliTuple[1]='root=v5-34-22  geant3=v1-15b \
             aliroot=master aliphysics=master \
             fastjet=3.0.6  fjcontrib=1.012'
```

while the variable `N_TRIAD` is now called `nAliTuple`.

Order of components (*e.g.* `root=...`) does not matter.

If you want to run AliRoot, then `root`, `geant3` and `aliroot` are mandatory.

When the Git repository split will be enacted, `aliphysics` will be needed as
well. For the moment, the `aliphysics` snippet is just ignored.

In case you only want to install and run ROOT, then specify only the `root`
snippet and you will be set.

FastJet components (`fastjet` and `fjcontrib`) are optional as usual.


#### How to upgrade

Your `alice-env.sh` script updates itself automatically as
[announced some months ago](/2014/08/13/alice-env-changes/): if your
`alice-env.sh` is older than August 2014 then you should update it manually.

If you don't want to wait for the automatic update, force an update check with:

```bash
source alice-env.sh -u
```

You will see some overly colored messages:

![alice-env.sh automatic update for tuples](/images/posts/aliroot-split-env-update.png)

They will inform you that:

* the script has been **updated**
* your configuration file has been **automatically migrated** to the new format
* your old configuration has been **backed up** for safety

If for some reason the update fails, you can always edit `alice-env.conf` by
hand following the guidelines provided by this post.

After the update proceed with the usual
[installation instructions](/alice/install-aliroot) that have been updated for
the occasion.

> [Automatic installation](/alice/install-aliroot/auto) is recommended
> as it is less error-prone.


### AliRoot installation

There has been a huge cleanup of the AliRoot build system. As any modern piece
of software, new AliRoot versions need to be installed in a directory different
from the build directory, and you need to specify some dependencies when
configuring it via CMake.


#### How to upgrade

If you are using the master, it will not work out of the box after the update:
you will need to clean it and rebuild it.

The procedure is:

* update the alice-env.sh script as explained above
* source the environment for the AliRoot master

You can now use the automatic installer like this:

```bash
bash <(curl -fsSL http://cern.ch/go/NcS7) --clean-aliroot --aliroot
```

It will automatically rebuild the most updated AliRoot from scratch for you.

If you want you can read more details on what changed below.


#### Changes in CMake

In practice, the CMake command for configuring AliRoot has new mandatory flags.
Assuming that:

* `ALICE_ROOT` is the AliRoot Core source directory
* `ALICE_BUILD` is the *temporary* build directory
* `ALICE_INSTALL` is the installation directory

the CMake command becomes:

```bash
cd "$ALICE_BUILD"
cmake "$ALICE_ROOT" \
  ...your_own_flags... \
  -DCMAKE_INSTALL_PREFIX="$ALICE_INSTALL" \
  -DALIEN="$ALIEN_DIR" \
  -DROOTSYS="$ROOTSYS" \
  -DFASTJET="$FASTJET"
```

The `FASTJET` parameter is mandatory if you want to use FastJet. `ALIEN`,
`ROOTSYS` and `CMAKE_INSTALL_PREFIX` are mandatory and they are no longer
detected from environment variables.


#### Changes in the installation

After configuring it, you will make and install it using:

```bash
make -j$MJ install
```

where `$MJ$` is the number of parallel threads you wish to use for building.
`make install` is mandatory: you cannot use just `make` anymore.

> `make install` will **not** work for older AliRoot versions: the
> [automatic installation](/alice/install-aliroot/auto) recognizes them
> automatically.


#### Changes in the destination directories

The new AliRoot binary and library directories are respectively:

* `$ALICE_INSTALL/bin`
* `$ALICE_INSTALL/lib`

and they do not contain anymore the `tgt_<arch>` subpath in `bin` and `lib`.

The new environment script sets `$PATH` and the library paths appropriately.


### What to do in case of troubles

Should a problem of any sort occur, do not hesitate to ask for help:

* <alice-project-analysis-task-force@cern.ch>

For more complex and critical problems, opening a ticket on the
[ALICE JIRA](https://alice.its.cern.ch/) is preferred.

