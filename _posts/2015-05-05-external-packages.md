---
title: Use prebuilt packages in alice-env.sh tuples
createtoc: true
---

The latest version of `alice-env.sh` contains a new feature: it is now possible
to set the environment for external pre-built packages of ROOT, Geant3, AliRoot
Core and AliPhysics.

It is also possible to mix pre-built packages with customly built ones.

This implementation follows a
[feature requests](https://alice.its.cern.ch/jira/browse/ALIROOT-5951).


### How to use prebuilt packages

To enable this feature, make sure you have the latest version of `alice-env.sh`:
it updates automatically, but if you are impatient:

```bash
source alice-env.sh -u
```

You can specify a tuple as the following example:

```bash
AliTuple[2]='alien=/shared/alice/alien \
             root=/shared/alice/root/v5-34-08/inst \
             geant3=/shared/alice/geant3/v1-15a/inst \
             aliroot=/shared/alice/aliroot/v5-06-16/inst \
             aliphysics=master'
```

From the example above:

* AliEn, ROOT, Geant3 and AliRoot Core will be taken from a remote directory
  (which can be, for instance, a **shared read-only directory** for a multi-user
  installation)
* AliPhysics (version *master*) is downloaded and built locally, against the
  pre-built software


### How to build packages to share

Following the directory convention from above, an administrator may simply
follow the [usual installation procedure](/alice/install-aliroot):
administrator's `alice-env.sh` script has to be downloaded into `/shared/alice`,
which will become the prefix of the shared ALICE software installation.

**Note:** it's better if `/shared/alice` (or any other directory you'd like to
use) is read-only for the end user.
