---
title: "Making ALICE releases"
layout: tweet

parnumbers: true
createtoc: true
---

All release operations occur via the [ALICE Jenkins](https://alijenkins.cern.ch)
interface, that requires a valid CERN login.


Create a new AliRoot/AliPhysics release
---------------------------------------

AliRoot and AliPhysics are tagged periodically from their respective master
branches. For each AliRoot tag, there is a corresponding AliPhysics tag created,
in the form:

* AliRoot **v5-07-66**
* AliPhysics **v5-07-66-01** *(-02, -03... for quick fixes)*

To build a new release login to [Jenkins](https://alijenkins.cern.ch) and start
a **build-any-ib** job. Use this
[direct link](https://alijenkins.cern.ch/job/build-any-ib/build?delay=0sec) for
convenience.


### Standard configuration

Normally we need to change only the following two fields:

* **ARCHITECTURE:** slc5_x86-64 *(note the dash and the underscore)*
* **PACKAGE_NAME:** aliphysics *(or* aliroot-test *if you want to run tests too)*
* **OVERRIDE_TAGS:** aliroot=v5-07-66 aliphysics=v5-07-66-01 *(space separated)*

> Changing the above and pressing **Build** is sufficient. Read on to know about
> extra options.


### Extra options

You can pick the desired version of the **aliBuild** tool by using:

* **ALIBUILD_REPO:** name of your GitHub fork for alibuild *(default: alisw)*
* **ALIBUILD_BRANCH:** Git branch of alibuild *(default: master)*

You can pick the desired recipes repository (alidist) by using:

* **ALIDIST_REPO:** GitHub repo with recipes *(default: alisw)*
* **ALIDIST_BRANCH:** Git branch of the above alidist repo *(default:
  IB/v5-06/prod)* (or pick the appropriate branch from the

Where to run the build:

* **MESOS\_QUEUE\_SIZE**: set it to *large* or *huge*. The default is appropriate
  in most cases.

Package cache:

* **PUBLISH_BUILDS:** uncheck this if you do not want the build results to be
  published (*e.g.* for tests)
* **USE\_REMOTE\_STORE:** uncheck this if you do not want to download already
  compiled binaries for your architecture but you want to rebuild everything
  from scratch


### Publishing

Publishing of releases occurs automatically and an email will be received when
the publishing is done.

The publisher publishes new packages based on matching rules: you can check them
[here](https://github.com/alisw/ali-bot/blob/master/publish/aliPublish.conf). By
default package dependencies are created automatically.


### Changing the AliRoot version for daily builds

After AliRoot has been successfully built, you have to configure the daily
builds to pick the new AliRoot version. This is done by going to the
[configuration page of daily-aliphysics](https://alijenkins.cern.ch/job/daily-aliphysics/configure)
and selecting the default value for **OVERRIDE_TAGS** to:

```
AliRoot=v5-07-66
```

(or the appropriate version).

Daily AliPhysics builds
-----------------------

The Jenkins [daily-aliphysics](https://alijenkins.cern.ch/job/daily-aliphysics/)
job attempts to tag the master of AliPhysics at 4pm Geneva time every day.

The process is fully automated. Admins receive an email in case build fails.

The build process:

1. Creates a new branch called **rc/vAN-YYYYMMDD** from the master.
1. Attempts to build it.
1. In case of success, tag **vAN-YYYYMMDD** is created and branch
   **rc/vAN-YYYYMMDD** is removed.


### In case of failure

In case you receive an email saying that the daily build failed (usually around
4.30pm), you have to analyze the build logs on Jenkins and see what broke the
build.

If it is a non-compilation error (*e.g.* it might be a temporary Git problem, or
a temporary Jenkins problem) just restart the Jenkins daily-aliphysics job from
scratch using the default options. Check the **OVERRIDE_TAGS** to see if the
correct base AliRoot version is used.

If there was a compilation error, after a fix is made into the master of
AliPhysics you must either delete the rc/vAN-YYYYMMDD manually, or restart the
build by checking the **REMOVE\_RC\_BRANCH\_FIRST**.
