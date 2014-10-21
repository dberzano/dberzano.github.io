---
title: Minor changes in automatic installer
createtoc: false
---

The automatic installation script has been updated, and its usability
has been hopefully improved.

Now you must load `alice-env.sh` before invoking the installer, and
pick the triad you wish to install explicitly.

Here is what is no longer supported or no longer needed:

* you do not need to invoke the installer from whitin the directory
  containing `alice-env.sh`;
* the variable `N_TRIAD` inside `alice-env.conf` is no longer
  effective in picking the triad: only explicit selection works.

Please note that you need a recent version of `alice-env.sh` for the
new installer to work. `alice-env.sh` now updates automatically: if it
does not, force an update with:

```bash
source alice-env.sh -u
```

A green message should confirm a successful upgrade.

> If updating does not work, your version of `alice-env.sh` is too
> old: proceed **manually** according to
> [these instructions](/2014/08/13/alice-env-changes).

Instructions for the automatic installation are found
[at the usual place](/alice/install-aliroot/auto).
