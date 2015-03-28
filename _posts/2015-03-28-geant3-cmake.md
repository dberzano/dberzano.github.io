---
title: Compiling Geant 3 v2-0 with CMake
createtoc: true
---

The new AliRoot Core version, v5-06-10, requires **Geant 3 v2-0**. This new
Geant 3 version introduces a major change in the way it is built: it uses CMake
and it therefore requires a **source, build and installation** directory.

Both the [installation instructions](/alice/install-aliroot/manual) and the
[automatic installer](/alice/install-aliroot/auto) have been updated to cover
both the old and the new Geant 3 version.

If you are still using an older Geant 3 version, such as **v1-15a**, and your
environment script has performed a self-update, you might notice that Geant 3 is
displayed as **not found**:

```
  Geant3         <not found>
```

This is because we have upgraded the directory schema in order to make it
compatible with the newer Geant 3 versions. You need to migrate your
installation from the old to the new schema.


### Migrating to the new Geant 3 directory schema

This procedure **takes seconds** and **you do not need to rebuild AliRoot and
AliPhysics**, only Geant 3.

If the environment script did not self-update automatically, do it manually:

```bash
source alice-env.sh -u
```

Then run:

```bash
[[ -f "$ALICE_PREFIX/geant3/$G3_SUBDIR/README" ]] && rm -rf "$ALICE_PREFIX/geant3/$G3_SUBDIR"
```

> Don't know if you were using the old or the new schema? Just **run the above
> command in any case**, it will figure it out for you.
