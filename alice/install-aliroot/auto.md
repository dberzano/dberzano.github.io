---
title: "Automatic AliRoot installation"
layout: tweet

createtoc: true
parnumbers: true
---


For convenience, a script for automatically installing AliRoot and its
dependencies is provided.

The script:

* follows exactly the same steps described in the
  [manual installation procedure](../manual);
* works on the same platforms where the manual procedure works.

There is no need to download the installation script: it can be run
**directly from the web**, ensuring that you are always using an
updated version.

Completion messages are hidden by the script, but they are still
available on log files. If the automatic procedure fails, the last
lines of this script are shown.


In trouble? Ask for support!
----------------------------

For any form of support, contact the following mailing list:

* <alice-project-analysis-task-force@cern.ch>

You can subscribe from [CERN e-groups](https://e-groups.cern.ch/).

**Please** don't write personal emails. Mailing list makes support
more efficient as other users might benefit from a single reply.

> In case of failure, the automatic installer advises the user to
> attach the two log files produced. **Please do not forget to do it**
> in order to facilitate the support procedure.


Quickstart: install (or upgrade) everything
-------------------------------------------

ALICE software needs an "environment" script to setup your shell environment
according to your requirements. Create the directory where all your software
will go, and launch the command that will automatically download the environment
script:

```bash
mkdir $HOME/alice
cd $HOME/alice
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --get-alice-env
```

Source the `alice-env.sh` script: a default `alice-env.conf` will be created and
must be edited according to your needs. Please refer to the
[manual](/alice/manual) to know how to edit it!

When done, source it again selecting the software combination you wish to
install, then run:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --all
```

This will install everything using all the available cores on your system.

To install everything using only one parallel thread *(useful if you
are doing some work while installing)*:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --all --ncores 1
```

You can specify any number of parallel threads you want.


Install (or upgrade) only selected components
---------------------------------------------

Components can be specified individually or in groups:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --alien --root --geant3 --aliroot --aliphysics --fastjet
```

The above line is equivalent to specifying only `--all`. Order of switches does
not matter: operations will be executed in the correct order.

For installing (or upgrading) only ROOT and Geant 3, for example, do:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --root --geant3
```


Clean installed software
------------------------

Cleaning the installation directories means to keep only the source
code and remove the build directories.

To clean all components:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --clean-all
```

You can specify also the components individually:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --clean-alien --clean-root --clean-geant3 --clean-aliroot --clean-fastjet --clean-aliphysics
```

The above command is equivalent to the `--clean-all` switch.

For cleaning only AliPhysics and FastJet, for example, do:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --clean-aliphysics --clean-fastjet
```


Collect system information
--------------------------

To collect information for reporting an issue:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --bugreport
```

A single file is produced and should be sent out for seeking support.

> The script warns you that the produced file **may contain sensitive
> information** that you do not wish to share. You can strip this
> information before sending it to others.


Download without compiling and vice-versa
-----------------------------------------

The automatic installation has two options for controlling the
software download:

* `--download-only`: software is downloaded and updated, but no build
  is launched;
* `--no-download`: software is only compiled, but not updated or
  downloaded.

Such options are useful if you want to download all the software
before going offline, for compiling it at a later time with no
connectivity.

For instance, when you are online you can fetch the newest AliRoot
updates:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --download-only --aliroot
```

When you are offline, you can compile what you have previously
downloaded:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --no-download --aliroot
```


Build options
-------------

It is possible to set explicitly the desired build optimization and debug levels
by means of the `--type` option.

* `--type normal` *(default if omitted)*: use debug symbols and optimization
* `--type optimized`: no debug symbols and maximum optimization
* `--type debug`: debug symbols and no optimization

Please refer to the [manual installation guide](manual) for more information
about the flags.

If you have built a component with a certain set of build flags and you want to
rebuild it, **you must clean it first**. For instance, for AliPhysics:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --clean-aliphysics --aliphysics --type optimized
```

The above command will clean the old AliPhysics build and it will rebuild it
for maximum optimization and without debug symbols.
