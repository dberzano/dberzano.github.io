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
  [manual installation procedure](manual);
* works on the same platforms where the manual procedure works.

There is no need to download the installation script: it can be run
**directly from the web**, ensuring that you are always using an
updated version.

Completion messages are hidden by the script, but they are still
available on log files. If the automatic procedure fails, the last
lines of this script are shown.

> In case of failure, the automatic installer advises the user to
> attach the two log files produced. **Please do not forget to do it**
> in order to facilitate the support procedure.


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


Quickstart: install (or upgrade) everything
-------------------------------------------

First of all, prepare your system, download the `alice-env.sh`
script and configure it by following the same steps described in the
[manual installation procedure](../manual#prepare_your_environment).

Then, only the first time:

```bash
bash <(curl -fsSL http://cern.ch/go/NcS7) --prepare
```

To install all using all the available cores:

```bash
bash <(curl -fsSL http://cern.ch/go/NcS7) --all
```

To install all using only one parallel thread (useful if you are doing
some work while installing):

```bash
bash <(curl -fsSL http://cern.ch/go/NcS7) --all --ncores 1
```

You can specify any number of parallel threads you want.


Install (or upgrade) only selected components
---------------------------------------------

Components can be specified individually or in groups:

```bash
bash <(curl -fsSL http://cern.ch/go/NcS7) --alien --root --geant3 --aliroot --fastjet
```

The above line is equivalent to specifying only `--all`. The
appropriate installation order is respected.

For installing (or upgrading) only ROOT and Geant 3, for example, do:

```bash
bash <(curl -fsSL http://cern.ch/go/NcS7) --root --geant3
```


Clean installed software
------------------------

Cleaning the installation directories means to keep only the source
code and remove the build directories.

To clean all components:

```bash
bash <(curl -fsSL http://cern.ch/go/NcS7) --clean-all
```

You can specify also the components individually:

```bash
bash <(curl -fsSL http://cern.ch/go/NcS7) --clean-alien --clean-root --clean-geant3 --clean-aliroot --clean-fastjet
```

The above command is equivalent to the `--clean-all` switch.

For cleaning only AliRoot and FastJet, for example, do:

```bash
bash <(curl -fsSL http://cern.ch/go/NcS7) --clean-aliroot --clean-fastjet
```


Collect system information
--------------------------

To collect information for reporting an issue:

```bash
bash <(curl -fsSL http://cern.ch/go/NcS7) --bugreport
```

A single file is produced and should be sent out for seeking support.

> The script warns you that the produced file **may contain sensitive
> information** that you do not wish to share. You can strip this
> information before sending it to others.
