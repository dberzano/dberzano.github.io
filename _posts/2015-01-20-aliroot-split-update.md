---
title: AliRoot and AliPhysics are now available
createtoc: true
---

AliRoot has been finally split in two repositories:

 * [AliRoot Core](https://git.cern.ch/web/AliRoot.git)
 * [AliPhysics](https://git.cern.ch/web/AliPhysics.git)

Both repositories are finally accessible in read-write with the same permissions
as before.

Read on for more information.


### Current status of split

Here is the list of what currently works and what has still to come.

 * **OK:** AliRoot Core and AliPhysics accessible in read-write
 * **OK:** build servers
 * **Testing now:** analysis trains
 * **To Do<sup>†</sup>:** publish AliRoot and AliPhysics on the Grid
 * **To Do<sup>†</sup>:** use AliPhysics from CVMFS

<sup>†</sup> *Items marked as* **To Do** *are expected to be solved by tomorrow*
**Wed Jan 21, 2015***.*

> Due to technical issues not under our control, you might experience problems
> performing Git operations.
>
> Because of such problems we are **one day late** on our [original schedule]
> (/2015/01/14/aliroot-split/#schedule).
>
> Git service is managed by CERN IT: we are currently in touch with them to
> have it fixed as quickly as possible.
>
> Info:
> [CERN IT Service Status Dashboard](https://cern.service-now.com/service-portal/ssb.do?area=IT)
> and the
> [incident report](https://cern.service-now.com/service-portal/view-outage.do?from=CSP-Service-Status-Board&&n=OTG0017655).


### Update your environment script and configuration

Provided that you are using
[these installation instructions](/alice/install-aliroot), you will need the new
version of `alice-env.sh`.

Force-update it:

```bash
source alice-env.sh -u
```

Now edit your `alice-env.conf` file. You can now specify, in your tuples, an
AliRoot Core (`aliroot=`) version and a different AliPhysics one
(`aliphysics=`).

For instance:

```bash
AliTuple[1]='root=v5-34-08 aliroot=master aliphysics=master'
```

This tuple builds ROOT v5.34.08, AliRoot Core master, and AliPhysics master.


### Upgrade your installation

[The manual](/alice/install-aliroot) has updated installation instructions. It
is recommended to proceed automatically.

You do not need to rebuild everything. Just:

 * clean current AliRoot
 * compile AliRoot Core
 * compile AliPhysics

This is done, with the automatic installation, with the following command:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --clean-aliroot --aliroot --aliphysics
```

No need to touch currently installed ROOT, AliEn, Geant or FastJet.

> You **must remove** completely your current AliRoot build directory and
> installation directory. Do it if you **install manually**: if you use the
> automatic installer it does it for you.


### I don't find my files! Where in the world are they!?

Some files have been kept in AliRoot Core, others have been moved in AliPhysics.

The complete list of what went were is [here](/2015/01/14/aliroot-split/): please
look at it very carefully!

History of changes of almost all files has been preserved: if this is not the
case (for some files it was impossible because of technical reasons), original
history up to the split is still available in AliRoot Core.

> The last commit in AliRoot Core still containing what has been moved to
> AliPhysics is [f39769157c](https://git.cern.ch/web/AliRoot.git/tree/f39769157c7ebf9260ec94294af22abe4e487823): follow the link to see all
> AliRoot files at that time (including your "lost" ones).


### Repository URLs and permissions

AliRoot Core is the same repository as before:

 * **http://git.cern.ch/pub/AliRoot**: read-only access, for everybody
 * **https://git.cern.ch/reps/AliRoot**: read-write access, might be used only
   if you are allowed to push

AliPhysics:

 * **http://git.cern.ch/pub/AliPhysics**: read-only access, for everybody
 * **https://git.cern.ch/reps/AliPhysics**: read-write access, might be used
   only if you are allowed to push

Please note that **you cannot use https URLs for reading** if you are not
explicitly allowed to use them. If you do not have push rights, you may use only
the http ones.

Permissions from the old AliRoot have been split accordingly and propagated to
the two new repositories. If your pushes are denied please send us an email and
we will fix it.


### Advantages of having two repositories

Splitting AliRoot in two allows us to:

 * keep a stable AliRoot Core that changes slowly
 * use the daily tags for the analysis-oriented AliPhysics

This is aimed also to save your time when building the software: you will not
need to update AliRoot Core continuously but only AliPhysics.

Moreover, we can move to a Git workflow "for experts" in AliRoot Core that
will include code revision before inclusion, and leave AliPhysics as it is
today.

For an in-depth explanation please see
[Peter Hristov's slides](https://indico.cern.ch/event/351206/session/0/contribution/6/material/slides/1.pdf).


### Decision and announcements of split operations

The decision to split repositories has been taken and announced during the
last [Offline Week](https://indico.cern.ch/event/351206/)

Split operations were [announced here](/2015/01/14/aliroot-split/) last week
(Wed Jan 14, 2015).
