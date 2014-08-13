---
title: Major changes in the alice-env.sh script
createtoc: true
---

The syntax of the `alice-env.sh` script has been left mostly untouched
since 2008. As of today, we introduce **three major changes**:

* The `alice-env.sh` script must be in the root directory of your
  ALICE software installation (the so-called *prefix*).
* Configuration is now expected to be in a **separate file** named
  `alice-env.conf`, in the same directory of the environment script.
* The environment script must be downloaded only once, as it will
  **update transparently**.

> Your current ALICE software does not need to be recompiled. The
> installation procedure and the automatic installer work as before.


Fresh installations
-------------------

The [installation guide](/alice/install-aliroot) has been updated with
the new conventions. If no configuration file is found, the first time
the user does:

```bash
source alice-env.sh
```

a template `alice-env.conf` will be created.


Migrating from the old alice-env.sh
-----------------------------------

Old versions of the script contain in a single file the environment
variables and some code. Open your old `alice-env.sh`: your old
configuration variables are at the beginning of the file. The end of
the configurable part is marked by a comment saying:

```
BEYOND THIS POINT THERE IS LIKELY NOTHING YOU NEED TO MODIFY
```

Create a new file, name it `alice-env.conf` and place it in the root
directory of your ALICE software: this directory used to be marked by
the `$ALICE_PREFIX` variable.

Paste the following variables from the *old* to the *new*
configuration file:

* All the `TRIAD[n]='...'` specifications
* `N_TRIAD=n`

**Do not define** the `ALICE_PREFIX` variable in the new configuration
file: it will be automatically defined as the directory containing
`alice-env.sh`.

If you have additional variables defined there (like the
`alien_API_USER` variable), copy them to the `alice-env.conf` file.

When you have finished migrating your variables, download the new
`alice-env.sh` as explained
[in the guide](/alice/install-aliroot/manual) and place it in the same
directory of your ALICE installation.

> Any direct change in `alice-env.sh` will be lost after the first
> update. Edit the `alice-env.conf` instead.


Automatic updates
-----------------

The new `alice-env.sh` automatically checks for updates. This is
supposed to reduce the number of issues due to outdated versions of
the script.

Updates are checked when `alice-env.sh` is sourced, if more than
**6 hours** have elapsed since last check.

If updates cannot be retrieved (*e.g.* in case no Internet connection
is available), they will be silently skipped.


### Stop and force automatic updates

Do not check for updates:

```bash
source alice-env.sh -k
```

Do not *ever* check for updates: in your `alice-env.conf` file:

```bash
ALICE_ENV_DONT_UPDATE=1
```

**Note:** you are strongly discouraged from doing that.

Check for updates *now* (also overrides `ALICE_ENV_DONT_UPDATE`):

```bash
source alice-env.sh -u
```

**Note:** if user has no permissions to write under the ALICE prefix
directory, the environment script does not even try to download the
updates. This makes it safe for shared installations performed by an
administrator.
