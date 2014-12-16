---
title: "The ALICE_ROOT variable"
createtoc: false
---

In order to uniform Grid and local AliRoot installations we have changed the
meaning of the `$ALICE_ROOT` environment variable in the `alice-env.sh` script.

* Old meaning: `$ALICE_ROOT` pointed to the AliRoot source directory.
* New meaning: `$ALICE_ROOT` points to the **AliRoot installation directory**.

The `$ALICE_BUILD` variable is no longer accessible in the environment to avoid
confusion.

AliRoot versions prior to the [CMake cleanup](/2014/12/15/aliroot-tuples-cmake)
cannot be installed using `make install`: for these versions, the AliRoot build
directory is symlinked to the installation directory and no `make install` is
run:

```bash
ln -nfs build "${ALICE_ROOT}"
```

[Installation instructions](/alice/install-aliroot/manual) and the
[automatic installer](/alice/install-aliroot/auto) have been updated to
accommodate legacy and new installation process.

You must force-update `alice-env.sh` to use the new environment:

```bash
source alice-env.sh -u
```

### Issues with include and macro paths

The new AliRoot installs header files (`.h`) in the following directory:

```
$ALICE_ROOT/include
```

This means that in your ROOT macros you can use:

```c++
gSystem->AddIncludePath( "-I$ALICE_ROOT/include" );
```

or:

```c++
gSystem->SetIncludePath( "-I... -I$ALICE_ROOT/include -I..." );
```

If your header file corresponds to a compiled `.cxx` file, it will be
automatically coped under `$ALICE_ROOT/include`.

If you do not find your header file there, you will need to ask an expert to
modify the `CMakeLists.txt` file of your directory by adding:

```cmake
install( FILES AliMyMissingHeader1.h AliMyMissingHeader2.h
         DESTINATION my_dest_dir_under_ALICE_ROOT )
```

The same rule applies for missing macros:

```cmake
install( FILES MyMissingMacro1.C MyMissingMacro2.C
         DESTINATION my_dest_dir_under_ALICE_ROOT )
```

You can also modify the `CMakeLists.txt` yourself (it is very easy) and send the
patch to an expert.

> **Do not include headers or load macros from the source directory** in your
> production code! They will not work on the Grid. Modify the
> `CMakeLists.txt` to have them installed properly.
