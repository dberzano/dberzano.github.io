---
title: OS X 10.11 El Capitan and patched ROOT
createtoc: false
---

Apple has recently released a new version of OS X and ALICE is ready to use it.

The [installation instructions](/alice/install-aliroot) have been updated
accordingly, as well as the [prerequisites](/alice/install-aliroot/prereq-osx).

With this new OS X release we are taking the opportunity to be more transparent
with respect to the software we release and publish on the Grid: notably, there
are some minor patches we apply on top of external software in order to make it
work for us.

Instead of recommending users to use a more recent version of ROOT (which, in
principle, would require validation), we have backported only the patches that
make it work both on the Grid and with El Capitan to a special branch of our
custom repository.

The upgrade procedure is very simple and it is explained in detail in the next
paragraph.


### Upgrade your ALICE installation

First things first: please read carefully the
[prerequisites for OS X](/alice/install-aliroot/prereq-osx) as they have
changed a bit.

Go through the following important checklist!

* As with every OS X upgrade, a new version of Xcode has been released and you
  **must** ugprade it.
* Do not forget to **update the command-line tools** for Xcode accordingly.
* A newer version of gfortran has been released, please upgrade it.
* Also XQuartz **must** be upgraded (you might need it for X forwarding on SSH
  connections).
* Upgrade your **Homebrew** installation as well as all the packages you have
  installed with it.
* Whenever you change compiler, Xcode, operating system, you **must clean all
  before compiling**.

Now, to use the patched ROOT version, you only need to change the `root=` entry
in your tuples from:

```bash
AliTuple[1]="root=v5-34-30 geant3=v2-0 ..."
```

to:

```bash
AliTuple[1]="root=alice/v5-34-30 geant3=v2-0 ..."
```

This is explained [here](/alice/install-aliroot/manual/#root) too.

After you have done that, run the
[automatic installer](/alice/install-aliroot/auto/): the following command will
make sure that everything is cleaned up before installing:

```
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --clean-all --all
```

### AliEn libraries

El Capitan has a new security enforcing feature called System Integrity
Protection that, among other things, affects the propagation of some environment
variables to programs launched by other programs. Notably, `LD_LIBRARY_PATH` and
`DYLD_LIBRARY_PATH` are stripped in such a case.

This is not a problem for the majority of ALICE software, as OS X-compiled
programs usually maintain in different ways a full-path reference to the linked
library, so that those variables are in most cases not needed anymore.

The way AliEn is used and compiled fails to work with this new security model.
Although there is a way to turn off it completely (absolutely not recommended),
we suggest a procedure to work around the AliEn problem that implies linking
AliEn libraries to a user-writable system location.

The procedure is available in the updated [AliEn installation
instructions](/alice/install-aliroot/manual/#alien). It is much easier to follow
it if Homebrew is installed.

### Support

Please address your inquiries to our [ALICE JIRA](https://alice.its.cern.ch/),
on the **AliRoot** project (use the **Installation** issue type).
