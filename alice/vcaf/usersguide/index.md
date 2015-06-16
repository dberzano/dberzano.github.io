---
title: "Virtual CERN Analysis Facility for users"
layout: tweet

parnumbers: true
createtoc: true
---

This guide provides basic information for using the PROOF-based Analysis
Facility for ALICE at CERN.


Overview
--------

The Virtual Analysis Facility is a PROOF cluster running on virtual machines. It
uses [PROOF on Demand](http://pod.gsi.de/) to submit PROOF workers on top of a
[HTCondor](http://research.cs.wisc.edu/htcondor/) batch system.

The whole operation is transparent to the users.


Connecting to the Virtual CAF
-----------------------------

Unlike former CAF, the Virtual CAF does not require ALICE software to be
installed on your computer: you need to SSH to one of the login nodes using your
CERN credentials:

* **alivaf-001.cern.ch**
* **alivaf-002.cern.ch**

Any node will work.

> Select a node randomly for now. A load balancer is being set up.

If you want to use the ROOT GUI make sure you connect with `-Y`:

```bash
ssh username@alivaf-003.cern.ch -Y
```

It is however recommended for performance reasons not to use X forwarding.

AFS is available from all the above nodes: your home directory on those nodes is
shared and it is the same home directory you have on **lxplus.cern.ch**.

> If you are connecting from outside CERN, you can do a SSH tunnel via lxplus to
> access any of the nodes:
>
> ```bash
> ssh username@lxplus.cern.ch -L 5522:alivaf-001.cern.ch:22
> ssh username@localhost -p 5522 -Y
> ```

Those login nodes contain all the software you need and the PROOF analysis will
be launched from there.

Make sure you have your Grid credentials `userkey.pem` and `usercert.pem` under
`~/.globus` of your AFS directory as they are required to use the Virtual CAF.


Running your analysis
---------------------

Running on the VAF is slightly different than running on the ALICE CAF: the main
difference is that you must request the number of PROOF workers you desire
before starting the analysis.

Choosing the appropriate AliRoot and/or AliPhysics version with its dependencies
is much simpler and it is done automatically to reduce user errors.


### Configuration file: AliRoot Core or AliPhysics version

Once you are connected via SSH to the Virtual Analysis Facility you are in an
environment where all the AliRoot Core and AliPhysics versions available on the
Grid from CVMFS can be used.

To select which AliRoot Core version to use, edit the file `~/.vaf/vaf.conf` and
set the following variable appropriately:

    export VafAliRootVersion='v5-06-22'

If you want to use AliPhysics instead:

    export VafAliPhysicsVersion='vAN-20150609'

Please note that:

*   if you export **only** `VafAliRootVersion`, AliPhysics and all of its
    variables will not be available;
*   if you export `VafAliPhysicsVersion`, the variable `VafAliRootVersion` will
    be ignored, as the appropriate AliRoot Core version will be automatically
    selected as a dependency.

> You do not have a conf file if you connect for the first time. Run:
>
> ```bash
> vaf-enter
> ```
>
> and a default configuration you can edit afterwards is generated.

The configuration file is very simple, and quite self-documented: if you mess it
up, just remove it and start `vaf-enter` again to recreate it:

```bash
rm -rf ~/.vaf/
vaf-enter
```

The official list of available AliRoot Core and AliPhysics versions is available
on [MonALISA](http://alimonitor.cern.ch/packages/):

*   set `VafAliRootVersion` without specifying `VO_ALICE@AliRoot::`
*   set `VafAliPhysicsVersion` without specifying `VO_ALICE@AliPhysics::`

You can **either** set AliRoot **or** AliPhysics. Dependencies are automatically
set, so:

*   if you set **AliRoot Core**, the appropriate ROOT version is loaded as well;
*   if you set **AliPhysics**, the appropriate AliRoot Core and ROOT versions
    are loaded.


### Load the shell environment

Enter the environment by typing:

```bash
vaf-enter
```

In case you haven't provided any configuration file, it will generate a sample
configuration in `~/.vaf/vaf.conf` and exit immediately. Edit it according to
the instructions in the previous paragraph.

This opens a new shell. To "clean" the environment, simply exit by typing:

```bash
exit
```

> **Note:** each time you change your AliRoot version, you need to exit and
> re-enter.

A token is automatically requested when entering the environment. All the ALICE
tools are available and can be used, like `aliensh` and `aliroot`.

You can check if the AliRoot version is the correct one by typing:

```bash
which aliroot
```


### Start your PROOF session

Inside the environment you can start your PROOF session by doing:

```bash
vafctl start
```

If you want, you can check if your PoD/PROOF server is up by typing:

```bash
pod-info -lcns
```


### Request PROOF workers

When your PROOF session is up, you must request some workers. To do so simply
run:

```bash
vafreq <NUM_OF_WORKERS>
```

where you will substitute the number of desired workers to `<NUM_OF_WORKERS>`.
The Virtual CAF is configured to allow one worker per core.

You can do it many times to add workers to a currently running PROOF session.
For instance, if you notice that the workers you have are not enough, you will
use `vafreq` to *add* some workers to it.

Not all the workers you request will be available immediately. You can monitor
the number of available workers by typing:

```bash
vafcount
```

The command can be terminated via `Ctrl-C`. When you consider you have an
appropriate number of workers running, you can start your PROOF analysis.

> Please note that the number available workers are subject to quotas in order
> to allow multiple users to use it!


### Running a PROOF analysis

The macro you use to start an analysis on the Virtual CAF is different than the
CAF, as it is much simpler: for instance you do not need to enable AliRoot or
AliPhysics there as it is already in the environment.

The new workflow consists of **opening the PROOF connection** and **enabling
some AliRoot libraries**. In most cases it is sufficient to open ROOT by running
`root`, and not `aliroot`.

This boils down to the following snippet:

```cpp
// List of AliRoot parameters
TList *list = new TList();
list->Add(new TNamed("ALIROOT_EXTRA_LIBS", "OADB:ESD"));
list->Add(new TNamed("ALIROOT_ENABLE_ALIEN", "1"));

// Open PROOF connection
TProof::Open("pod://");

// Upload and enable package
gProof->UploadPackage("/afs/cern.ch/alice/offline/vaf/AliceVaf.par");
gProof->EnablePackage("/afs/cern.ch/alice/offline/vaf/AliceVaf.par", list);
```

Datasets have also different names with respect to the CAF. Names used here are
*semantic*, as explained later in the documentation.


#### The AliceVaf.par package

Use the `AliceVaf.par` package to enable and control AliRoot options on the
client, master and all the workers. Such options include things as connecting to
AliEn or enabling extra libraries.

> The package is kept on AFS: this ensures that always the latest version is
> automatically used.

Options are passed via `TNamed` objects constituted by two parameters: the
option name and the option value (both are strings). A `TList` of `TNamed`
objects is passed as the second argument of the `EnablePackage()` function, as
seen from the code snippet above.

The following options are available:

* `ALIROOT_EXTRA_LIBS`: list of colon-separated extra AliRoot libraries to load,
  such as `OADB:ESD:STEERbase`. Names with or without the leading `lib` are both
  accepted.
* `ALIROOT_EXTRA_INCLUDES`: list of colon-separated extra AliRoot include paths
  with respect to `$ALICE_ROOT`, such as `STEER:TOF:PWG/FLOW/Base`.
* `ALIROOT_ENABLE_ALIEN`: set it to `1` to enable AliEn on all workers - this is
  needed if you want your workers to access `alien://` files.

The following extra options are still provided for compatibility with legacy CAF
and old AliRoot versions, but **should not be normally used**:

* `ALIROOT_MODE`: normally not used anymore since 2015. Set it to `aliroot`,
  `sim` or `rec` to load on all the workers all libraries specified respectively
  in `$ALICE_ROOT/macros/loadlibs.C`, `loadlibssim.C` or `loadlibsrec.C`. You
  can also set it to `base` to load a set of base AliRoot libraries. Currently,
  library loading occurs automatically in most cases: you should use only
  `ALIROOT_EXTRA_LIBS` to specify libraries that are not loaded automatically.

None of the options above is mandatory, except `ALIROOT_ENABLE_ALIEN` which must
be set to 1 if input data comes from AliEn (*i.e.* `alien://` URLs).


### Turn off your PROOF cluster

When your working day is finished, remember to turn off your PROOF cluster to
free resources:

```bash
vafctl stop
```

This will be done automatically in any case if you forget.


How to specify a dataset
------------------------

The Virtual CAF reads data directly from AliEn. As dataset name you should use
a string that looks for data from the AliEn File Catalog.

The following minimal example is used to match AODs: in principle you should
only replace year, period, run number, pass and AOD level to get the data you
want.

Consider the following minimal example:

```cpp
// Open PROOF connection
TProof::Open("pod://", "masteronly");

// Dataset specification: identical to AliEn "find". This is a single string: it
// is suggested to split it like in this example for readability reasons
TString dataset = "Find;"
                  "BasePath=/alice/data/2013/LHC13e/000195949/ESDs/muon_pass2/AOD134/%/;"
                  "FileName=root_archive.zip;"
                  "Anchor=AliAOD.root;"
                  "Tree=/aodTree;"
                  "Mode=remote;",

// Always show the dataset before running!
gProof->ShowDataSet( dataset.Data() );
```

The `BasePath` and `FileName` parameters select the same data the following
AliEn shell command selects (test it from `aliensh`):

```bash
find /alice/data/2013/LHC13e/000195949/ESDs/muon_pass2/AOD134/%/ root_archive.zip
```

`%` is a "jolly" character. In the context above, it matches all files inside
any subfolder (`%`) of `AOD134`.

The `Anchor` parameter tells PROOF that we want to analyze `AliAOD.root` from
inside the `root_archive.zip` file.

The `Tree` parameter tells PROOF that we should consider data coming from the
`/aodTree`.

The `Mode` parameter, when set to `remote`, tells PROOF not to check (open)
every file while creating a dataset. Always set it to `remote` when running on
data that comes from AliEn to allow for much quicker dataset creation.

> Always test the search before starting the analysis on a potentially enormous
> dataset! `gProof->ShowDataSet()` is your friend!


### Example with ESDs

This example is the template to use to match ESD files: in principle you should
only replace year, period, run number and pass to get the data you want.

```cpp
TString dataset = "Find;"
                  "BasePath=/alice/data/2010/LHC10h/000137748/ESDs/pass2/%.%/;"
                  "FileName=root_archive.zip;"
                  "Anchor=AliESDs.root;"
                  "Tree=/esdTree;"
                  "Mode=remote;"
```

Note that the tree name is different, as well as the anchor.

In this case, the `%` ("jolly character") matches all files contained in a
subdirectory of `pass2` whose name contains a dot, `%.%`.


Keep PROOF running even if SSH fails
------------------------------------

If your network connectivity has problems, it might happen that the SSH
connection to the VAF fails in the middle of a PROOF analysis: to prevent losing
your work, you can use `screen`.

Another common use case of `screen` is whenever you start your analysis from
your office's network, then you want to reconnect from home: with `screen` it is
possible to "detach" a session, let it continue in the background and "reattach"
it whenever and wherever you want.

A quickstart with the most common `screen` commands and operations is presented.
If you need further information, have a look at the official [screen documentation](http://www.gnu.org/software/screen/manual/screen.html).


### Creating a new screen

You can think of screens as "terminals inside other terminals". After
you have connected to the VAF via SSH, do, **inside the remote
session's shell and not from your laptop's terminal**:

```bash
screen -S anyNameYouWant
```

where quite intuitively you'll substitute `anyNameYouWant` with any name you
want.

A new "session inside a session" is opened: from this session you can continue
your work.


### Start a ROOT session inside a screen

In order to benefit from session detaching, you **must** start your ROOT session
**in batch mode**, *i.e.* with no graphical interface. To do that, simply append
`-b` to your `root` (or `aliroot`) command:

```bash
root -b
```

From this point on, if you are inside a screen, your ROOT and PROOF session are
"protected": if the connection fails, you will be able to reconnect and resume
your work.


### Detach a screen

In case you would like to "detach" a screen manually, from inside a screen you
should press:

```
Ctrl + A + D
```

meaning that, while keeping the `Ctrl` key pressed, you will press and release,
in order, first `A`, then `D`.


### List and attach existing screens

If you want to reconnect to an existing screen session, list your currently
available screens before:

```bash
screen -ls
```

You'll be presented with an output similar to:

```
There is a screen on:
  1857.JPsiAnalysis (Detached)
1 Socket in /var/run/screen/S-dberzano.
```

In this case there is only one named screen, that you can connect to by typing:

```bash
screen -rd JPsiAnalysis
```

If you have only one session, you can omit the screen name:

```bash
screen -r
```

If you have multiple sessions with the same name, you can use the session ID
(*i.e.*, the number right before the screen's name in `screen -ls`):

```bash
screen -rd 1857
```

**Note:** keep in mind that you cannot attach a screen from inside another
screen. Be sure to detach your current screen before attaching a new one.


Example analysis
----------------

To get started with the Virtual Analysis Facility you can copy to your home
directory a sample analysis located on AFS:

```bash
rsync -av /afs/cern.ch/alice/offline/vaf/examples/SimplePtTestOnPoD/ ~/SimplePtTestOnPoD/
```

The steering macro is `RunPoD.C`: you will notice that there is no selection of
the AliRoot, AliPhysics or ROOT version since they were already selected
consistently on the whole cluster by editing the `~/.vaf/vaf.conf` file.

To run it from the VAF environment:

```bash
vafctl stop
vafctl start
vafreq 30  # or the desired number of workers
```

Wait for a certain number of available workers (you can check with `vafcount`),
then run:

```bash
root RunPoD.C  # add -b for batch mode
```

The analysis will show an histogram and will produce the usual
`AnalysisResults.root` file.


Troubleshooting
---------------

In case of problems (PROOF hangups, unexpected crashes, etc.) you can restart
PROOF on your own without contacting the administrators by doing:

```bash
vafctl stop
vafctl start
```

This is the general recover procedure in case something goes wrong. When you
restart PoD/PROOF like this, you must ask for new workers again using `vafreq`.

In case of inquiries please open a
[JIRA ticket on the AAF project](https://alice.its.cern.ch/).
