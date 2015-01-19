---
title: AliRoot repository split
createtoc: true
---

As discussed during the last
[ALICE Offline Week](https://indico.cern.ch/event/351206/) and finally announced
during
[this Monday's Weekly Computing Board](https://indico.cern.ch/event/364271/),
the AliRoot Git repository is going to be split into two distinct repositories:

* AliRoot Core
* AliPhysics


### Repositories

Current AliRoot repository is what we refer to as **AliRoot Core**: it will be
the same as today, but some *modules* (*i.e.* top-level directories in the
source) will not be there anymore, as they are going to be moved in a new
repository called **AliPhysics**.

The complete list of modules moved from AliRoot Core to AliPhysics follows:

 * CORRFW
 * JETAN
 * OADB
 * PWG
 * PWGCF
 * PWGGA
 * PWGDQ
 * PWGHF
 * PWGJE
 * PWGLF
 * PWGPP
 * PWGUD

The above modules will be found at top-level directories inside the AliPhysics
repository.

Moreover, the following **ANALYSIS submodules** will be transferred to
AliPhysics (libraries retain their origial name):

 * Tender → TENDER/Tender, `libTender`
 * TenderSupplies → TENDER/TenderSupplies, `libTenderSupplies`
 * EventMixing → EVENTMIX, `libEventMixing`

> **How to read this map:** *e.g.* what was  *ANALYSIS/Tender* in the root of
> AliRoot Core is now *TENDER/Tender* in the root of AliPhysics.

Subdirectory **HLT/JET** will be moved to AliPhysics as well, to a new top-level
directory called **HLTANALYSIS**:

 * HLT/JET → HLTANALYSIS/JET (corresponding library, `libAliHLTJET`, retains the
   original name)

The following classes from **ANALYSISalice** will become part of the
**OADB library** (*i.e.* `libOADB`) in AliPhysics:

 * AliBackgroundSelection
 * AliCentralitySelectionTask
 * AliPhysicsSelection
 * AliPhysicsSelectionTask
 * AliTriggerAnalysis
 * AliAnalysisUtils
 * AliCollisionNormalization
 * AliCollisionNormalizationTask
 * AliEPSelectionTask

The following macros will be moved from **ANALYSIS/macros** to **OADB/macros**:

 * BrowseAndFillPhysicsSelectionOADB.C
 * AddTaskPhysicsSelection.C
 * AddTaskCentrality.C

The following classes from **EVE/EveBase** will become part of a new library in
AliPhysics: library will be called `libEveAnalysis`, and it will be associated
to the top-level directory **EVEANALYSIS**:

 * AliEveBeamsInfo
 * AliEveBeamsInfoEditor
 * AliEveLego
 * AliEveLegoEditor

Classes from module **TOF/TOFcalib** will be moved to **PWGPP/TOF** and will be
part of `libPWGPP`, while `libTOFcalib` does not exist anymore:

 * TOF/TOFcalib → PWGPP/TOF (`libTOFcalib` → part of `libPWGPP`)


### Environment variables and installation

AliRoot installation (*i.e.* **AliRoot Core**) stays the same. This means that,
if you have it already built, after the split you will just pull from Git and
compile as usual.

You will have to clone the new **AliPhysics** repository and build AliPhysics:
the procedure will be published [at the usual place](/alice/install-aliroot)
when the repository is ready.

Please note that having two repositories implies having two different variables
pointing to their respective installation directories! We will then have:

 * `ALICE_ROOT` pointing to the **AliRoot Core** installation directory
 * `ALICE_PHYSICS` pointing to the **AliPhysics** installation directory

> If you are loading things from a module that has been moved to AliPhysics,
> you will have to refer to it using `$ALICE_PHYSICS` instead of `$ALICE_ROOT`.
> **Read carefully what follows!**

Let's take an example:

```{c++}
gROOT->LoadMacro("$ALICE_ROOT/PWGJE/macros/AddTaskJets.C");
```

The path points to a macro in **PWGJE**: this is one of the modules we have
moved to AliPhysics. You therefore **must** change the load command to:

```{c++}
gROOT->LoadMacro("$ALICE_PHYSICS/PWGJE/macros/AddTaskJets.C");
```

#### Migrate now to ALICE_PHYSICS!

For **backward compatibility** and in order to allow a gradual transition to the new
variables schema, `ALICE_PHYSICS` and `ALICE_ROOT` are currently both available
on the Grid and locally (if you are using the
[official installation procedure](/alice/install-aliroot)).

For AliRoot versions after the split they will point to different locations.

> As `ALICE_PHYSICS` is already available, **please start upgrading your code
> now**! It will then work seamlessly after the split.

Check the next paragraph for the migration schedule.


### Schedule

 * **Friday Jan 16**: AliRoot Git repository will be set to **read-only** mode
   and therefore it will be impossible to push new changes there. Then, the
   split procedure will be started, and this is expected to last for the
   weekend *([see why](#technical_overview) it takes that much)*.
 * **Monday Jan 19**: AliRoot repository will be set again to **read-write**,
   and the new AliPhysics repository will be available for pushing as well. New
   code can be added, but tags will not be creaded yet.
 * **Tuesday Jan 20**: Test tags will be created and central operations (such as
   trains) will be tested.
 * **Wednesday Jan 21**: Operations will be back to normal.

> **Please push your code before Friday Jan 16!** This will make things easier
> for you.


### Technical overview

Current AliRoot repository has over 60k commits over 16 years. In order to
create AliPhysics we have prepared a procedure that will run through every
single commit and will reproduce it into AliPhysics only if it contains files
from one of the relevant directories.

This is a time-costly operation that will last several hours. For this reason,
during this phase both AliRoot and AliPhysics will be in **read-only mode**,
meaning that users will not be able to push code from there.


### Why the split?

Splitting AliRoot repositories is the first necessary step towards having two
different workflows for **AliRoot Core** and the **AliPhysics**.

**AliRoot Core:**

* will be modified **only by experts**
* the "master" is supposed to **always compile**
* code is **reviewed and validated** before making it to the master
* its release cycle will be **slow** (*i.e.* once per month)

**AliPhysics:**

* will depend on a **minimum version of AliRoot Core**, and such
  dependency is **enforced** at build time
* will have a more **flexible commit policy** where users can commit without
  code review
* will ultimately contain mostly **"user code"**, *e.g.* **analyses** for the
  trains
* will have a **daily release cycle** for making the most recent analyses
  versions catching the train in time

Having two different repositores allows us to accommodate the need for a stable
core software with the typically "chaotic" workflow of user's code.

> See
> [this presentation from Peter Hristov](https://indico.cern.ch/event/351206/session/0/contribution/6/material/slides/1.pdf)
> for a full explanation.
