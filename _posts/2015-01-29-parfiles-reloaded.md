---
title: PARfiles, reloaded
createtoc: true
---

As requested by users, we are (re)introducing PARfiles in AliRoot Core and
AliPhysics.

PARfiles support has been completely rewritten in order to leverage
**modularity** in AliRoot/AliPhysics.

Please read on to see what's new.

> If you have problems with PARfiles or suggestions and feature requests, please
> [open a JIRA ticket to the AliRoot project](https://alice.its.cern.ch/)!


### What is a PARfile

A PARfile is a compressed tarball containing source files, header files plus
some extra information explaining how to build them. PARfies are a ROOT (but
more specifically PROOF) feature, and there is
[some documentation available](https://root.cern.ch/drupal/content/working-packages-par-files)
for the curious.

You don't need to use PROOF to use PARfiles.


### Why using a PARfile

There is a 1:1 correspondence between a library (say, `libMODULE.so`) and a
PARfile (whose name will be `MODULE.par`): this means that the PARfile will
contain the *sources* (but not the *binaries*) necessary to produce its
corresponding libraries.

A PARfile is used to **hotpatch** a certain AliRoot/AliPhysics version, *e.g.*
on the Grid, by **overriding** a certain library with the one we provide.

This might be needed for several reasons:

 * you want to **test some modifications on the Grid** without pushing your
   changes upstream
 * you have some **personal classes** you do not want to publish ever


### A more modern PARfile interface

The legacy PARfiles implementation in AliRoot required that every single module
had their own:

 * **Makefile**
 * **BUILD.sh** *(called by ROOT, expected to contain the build recipe)*
 * **SETUP.C** *(called by ROOT, expected to load the library and setup the ROOT
   environment, such as include paths, etc.)*

This effectively duplicated the existing build system and delegated to the users
the hassle of adjusting and maintaining those files for every platform and
possible use case.

This created a plethora of unmaintained code, or fixes imported in one module
but missing in the others.

The new PARfiles implementation requires users to **add a single line to the
CMakeLists.txt**, and the build system of AliRoot/AliPhysics will do the rest.

The "PARfile build system" is automatically generated and it's the same for
every PARfile. This is far more sustainable, as:

 * the build system creation is centralized and no longer delegated to the
   (poor) user
 * if we spot and fix a problem in a PARfile, it will be automatically solved
   for all PARfiles


### Create a PARfile in AliRoot Core and AliPhysics

If you want to enable PARfiles for your library, you need to modify the
**CMakeLists.txt** where your library is created, and add the following line
(generally after the `generate_rootmap` part):

```cmake
# Generate a PARfile target for this library
add_target_parfile(${MODULE} "${SRCS}" "${HDRS}" "${MODULE}LinkDef.h" "${LIBDEPS}")
```

Normally, variables with those names are already defined in your
**CMakeLists.txt** so you do not actually need to understand what it means.

Experts might find interesting to read the in-source documentation located in
the following files

 * cmake/GenParFiles.cmake
 * cmake/CMakeLists.example

Adding the line above **does not generate a PARfile**, but it tells CMake to
enable PARfile generation for a certain module.

To effectively create the PARfile, go in the AliRoot/AliPhysics build directory
(you must have already created and configured it with CMake), and run:

```bash
cd $ALICE_ROOT/../build  # or in general the AliRoot/AliPhysics build dir
cmake ../src
make MODULE.par
make -j$MJ install
```

The resulting PARfile will be found in:

```
$ALICE_ROOT/PARfiles/MODULE.par
```

The given PARfile can then be used as usual with the Analysis Plugin on the Grid
or with PROOF.


#### Special case: extra includes

If the PARfile needs "extra" include paths to look for header files during the
build process, you can supply an extra argument to the `add_target_parfile`
function: a string with space-separated include paths.

Such include paths can:

 * be relative to the current module's source directory (it will be replicated
   as is in the PARfile): so if the current module has the SUBDIR subdirectory,
   just specify `"SUBDIR"` as additional parameter
 * be absolute, but **bear in mind that the PARfile will be built on a remote
   computer that does not have the same absolute paths as yours**: this is why
   it is possible to specify Makefile-style variables like `$(ALICE_ROOT)`: by
   using parentheses (instead of curly braces) you make sure that the variable
   is expanded on the *remote* computer and not on *your* computer

An example can be found in **PWGCF/Correlations/DPhi/CMakeLists.txt**: it needs
Pythia headers to build:

```cmake
# Note the additional header path that uses parentheses (and NOT curly braces)
add_target_parfile(${MODULE} "${SRCS}" "${HDRS}" "${MODULE}LinkDef.h" "${LIBDEPS}" "$(ALICE_ROOT)/include/pythia")
```
