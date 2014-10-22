---
title: OS X Yosemite support for AliRoot is here
createtoc: false
---

ALICE installation instructions have been updated for the new release
of OS X: **10.10 "Yosemite"**, released by Apple on Oct 16, 2014.

You can find the instructions at the
[usual place](/alice/install-aliroot).

> Do not forget to check the
> [prerequisites](/alice/install-aliroot/prereq-osx) and the
> [minimum software versions](http://localhost:4000/alice/install-aliroot/#compatibility_grid)!


### Release notes

* As with every OS X upgrade, a new version of Xcode has been released
  and you **must** ugprade it.
* Do not forget to **update the command-line tools** for Xcode
  accordingly.
* Also XQuartz **must** be upgraded.
* Upgrade your **Homebrew** installation as well as all the packages
  you have installed with it.
* **Very important:** you need **at least ROOT v5-34-22 with
  Yosemite**. This is now ensured by the
  [automatic installer](/alice/install-aliroot/auto), but you must
  check it manually if you use the
  [manual procedure](/alice/install-aliroot/manual).
* Whenever you change compiler, Xcode, operating system, you **must
  clean all before compiling**.
