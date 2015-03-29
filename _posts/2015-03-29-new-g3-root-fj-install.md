---
title: New schema for ROOT, Geant 3 and FastJet
createtoc: true
---

With the latest AliRoot Core release, **v5-06-10**, we have changed the default
ROOT version to **v5-34-26** and the default Geant 3 version to **v2-0**.

A change in the ROOT version implies that the following components need to be
rebuilt from scratch:

* ROOT
* Geant 3
* AliRoot Core
* AliPhysics

We took this occasion for providing a major upgrade in the installation
procedure for three components:

* ROOT
* FastJet
* Geant 3

Those components now require, similarly to AliRoot Core and AliPhysics, a
different **source** and **installation** directory.

ROOT and Geant 3, in addition, are now built out-of-source: they also require
a **build** directory.

For Geant 3 v2-0 this migration was forced, as it finally uses CMake.

The new installation schema, for consistency, is also applied to versions of
ROOT prior to v5-34-26 and to versions of Geant 3 prior to v2-0.


### ROOT, Geant 3, FastJet "not found"

When you source `alice-env.sh` the following might show up, even if you have
those components installed:

```
  ROOT           <not found>
  Geant3         <not found>
  FastJet        <not found>
```

This means that the script self-updated to the new directory schema, and it
cannot find ROOT, Geant 3 and FastJet in the former directory any longer.

An action is required from your side: you need to recompile the full software
chain from scratch in order to comply with the new schema.

> Recompiling the full chain takes a while: we chose to migrate during a ROOT
> and Geant 3 version change because you would have had to recompile everything
> in any case.
>
> Bite the bullet and make the upgrade: in `alice-env.conf` select **ROOT
> v5-34-26** and **Geant 3 v2-0** before recompiling.

The [installation instructions](/alice/install-aliroot/manual) have already been
updated accordingly. Please update the environment script first, if auto-update
did not occur for some reason:

```bash
source alice-env.sh -u
```

As usual, however, the most convenient way is to use the [automatic
installer](/alice/install-aliroot/auto):

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --clean-all --all
```

The automatic installer **does not delete your AliRoot Core and AliPhysics
source code**: your work is safe.

> Do not take shortcuts: sadly you really need to recompile all.


### Cleaning up "old schema" installations manually

If you use the [automatic installer](/alice/install-aliroot/auto), the old
installation directories for ROOT, Geant 3 and FastJet are automatically
removed.

If you want to do it manually, proceed as follows.

First, make sure you have the latest version of the environment script:

```bash
source alice-env.sh -u
```

Pick your desired tuple.

Clean up old ROOT:

```bash
[[ -f "$ALICE_PREFIX/root/$ROOT_SUBDIR/LICENSE" ]] && rm -rf "$ALICE_PREFIX/root/$ROOT_SUBDIR"
```

Clean up old Geant 3:

```bash
[[ -f "$ALICE_PREFIX/geant3/$G3_SUBDIR/README" ]] && rm -rf "$ALICE_PREFIX/geant3/$G3_SUBDIR"
```

Clean up old FastJet:

```bash
rm -rf "$ALICE_PREFIX/fastjet/$FASTJET_VER/"{bin,include,lib}
```


### Problems?

If you find any problem in the new installation procedure:

* do **not** send personal emails
* do **not** send emails to the mailing list

Instead, do **open a JIRA ticket** from [here](https://alice.its.cern.ch/) so
that we can keep track of issues more easily:

* select **AliRoot** as *project*
* select **Dario Berzano** as *assignee*
* select **Installation** as *component*
