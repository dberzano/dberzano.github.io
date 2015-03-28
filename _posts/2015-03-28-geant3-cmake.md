---
title: Updated procedure for ROOT and Geant 3
createtoc: true
---

The new AliRoot Core version, v5-06-10, requires **ROOT v5-34-26 and Geant 3
v2-0**. This new Geant 3 version introduces a major change in the way it is
built: it uses CMake and it therefore requires a **source, build and
installation** directory.

As we are undergoing a major change in our default ROOT version, we are taking
advantage of this transition phase to introduce the concept of source, build and
installation directory to ROOT as well.

This means that, while you are installing the new ROOT and Geant 3 versions,
you will have to use a new installation schema.

Both the [installation instructions](/alice/install-aliroot/manual) and the
[automatic installer](/alice/install-aliroot/auto) have been updated to cover
both the old and the new Geant 3 version, and to migrate your existing ROOT and
Geant 3 installation to the new directory schema.


### ROOT and Geant 3 "not found"

You might notice that, when loading the environment variables, ROOT and Geant 3
might suddenly appear as **not found**:

```
  ROOT           <not found>
  Geant3         <not found>
```

This is due to our upgrade to the new directory schema: the script looks for the
software in new directories.


### Migrating to the new ROOT and Geant 3 directory schema

The best way to migrate to the new schema is to source the environment script,
pick the desired tuple and use the
[automatic procedure](/alice/install-aliroot/auto):

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --root --geant3
```

If you want to do it manually, start by updating the script (if it did not do
it automatically already):

```bash
source alice-env.sh -u
```

Clean up the old ROOT directory:

```bash
[[ -f "$ALICE_PREFIX/root/$ROOT_SUBDIR/LICENSE" ]] && rm -rf "$ALICE_PREFIX/root/$ROOT_SUBDIR"
```

Clean up the old Geant 3 directory:

```bash
[[ -f "$ALICE_PREFIX/geant3/$G3_SUBDIR/README" ]] && rm -rf "$ALICE_PREFIX/geant3/$G3_SUBDIR"
```

Then follow the [manual instructions](/alice/install-aliroot/manual).
