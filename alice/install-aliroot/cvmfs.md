---
title: "Use AliRoot from cvmfs"
layout: tweet

createtoc: true
parnumbers: true
---


ALICE jobs running on the Grid use AliRoot versions from cvmfs: if you
do not need to compile your own AliRoot version, you can do that too,
provided that you have access to a computer, or a virtual machine,
running a compatible operating system.


Compatible platforms
--------------------

AliRoot software is compiled for all the operating systems compatible
with **RedHat Enterprise Linux 6 (RHEL 6)**: as RHEL 6 is a commercial
operating system, several free binary-compatible OSes exist.

For simplicity, they usually carry **the same version number**; to
mention the most popular:

* [CentOS 6](http://www.centos.org/)
* [Scientific Linux CERN 6 (SLC 6)](http://linux.web.cern.ch/linux/scientific6/)

Such operating systems have very long-term releases and for this
reason they are considered **very stable** for running Grid software,
but also **unsuitable** for running desktop applications: it is
therefore recommended that you install them in a virtual machine, or
access them via SSH.

> For all CERN users, the quickest way to access Scientific Linux CERN
> 6 is by **connecting to lxplus via SSH**:
>
> ```bash
> ssh -X cern_user_name@lxplus.cern.ch
> ```
>
> This service is also accessible from outside CERN.

Another popular Linux distribution compatible with RHEL and far more
suitable for a desktop environment is
[Fedora](http://fedoraproject.org/): however the compatibility is
quite loose, as some corresponding RHEL versions are mostly regarded
as "reference versions" and not as "compatible versions":

* [RHEL reference versions for Fedora](http://fedoraproject.org/wiki/Red_Hat_Enterprise_Linux#History)

> Please choose the **64 bit versions (x86_64)** of the aforementioned
> operating systems!


Install AliRoot requirements
----------------------------

Some packages are required to run AliRoot. Install them like this, as
root:

```bash
yum install gcc gcc-c++ gcc-gfortran libXpm compat-libgfortran-41 tcl compat-libtermcap redhat-lsb-core
```

If you are connected to **lxplus**, those packages are already in
place.


Install cvmfs
-------------

If you are using **lxplus**, you can skip this paragraph: cvmfs is
happily installed and kept up-to-date already.

Become root on your system (either by using `su`, or `sudo -sE`).
Create a file named `/etc/yum.repos.d/cvmfs.repo` with the following
content:

```ini
[cvmfs]
name=CernVM-FS Stable
baseurl=http://cvmrepo.web.cern.ch/cvmrepo/yum/cvmfs/EL/$releasever/$basearch
enabled=1
gpgcheck=0
```

Now run, always as root:

```bash
yum install cvmfs
```

### Configure cvmfs

Before you start plunging into cvmfs, you need to configure it. It
takes seconds. As root, do:

```bash
echo CVMFS_HTTP_PROXY="DIRECT" > /etc/cvmfs/default.local
```

> If you know for sure that you have a HTTP proxy somewhere, do:
>
> ```bash
> echo CVMFS_HTTP_PROXY="http://your_proxy_server:3128" > /etc/cvmfs/default.local
> ```
>
> If you don't know what we are takling about, **skip this box**.

Then, always as root:

```bash
cvmfs_config setup
cvmfs_config reload
service autofs forcerestart
chkconfig autofs on
```

Check if it works:

```bash
ls -l /cvmfs/alice.cern.ch/
```

**Note:** cvmfs appears like a local filesystem, but it is not. Files
you see there are available remotely, and downloaded on demand, and
all of it happens transparently for you.


Use AliRoot from cvmfs
----------------------

As your normal user (not root), load the ALICE environment from cvmfs:

```bash
source /cvmfs/alice.cern.ch/etc/login.sh
```

You might find convenient to add this line to your `~/.bashrc`. List
all available AliRoot versions:

```bash
alienv q | grep AliRoot
```

Choose one. For instance:

```bash
alienv enter VO_ALICE@AliRoot::vAN-20141006
```

Do not forget the `VO_ALICE@AliRoot::` prefix. A new shell is opened
where you have your ALICE programs available, and all dependencies are
automatically set:

```console
$> which aliensh
/cvmfs/alice.cern.ch/x86_64-2.6-gnu-4.1.2/Packages/AliEn/v2-19-223/api/bin/aliensh
$> which root
/cvmfs/alice.cern.ch/x86_64-2.6-gnu-4.1.2/Packages/ROOT/v5-34-08-6/bin/root
$> which aliroot
/cvmfs/alice.cern.ch/x86_64-2.6-gnu-4.1.2/Packages/AliRoot/vAN-20141006/bin/tgt_linuxx8664gcc/aliroot
```

> Do not be scared if it takes time to list AliRoot versions or to
> open AliRoot: software is transparently downloaded the first time,
> but then it is **cached locally** for faster access.

To "unload" the current environment, just exit the shell:

```bash
exit
```


### Load an AliRoot version inside a shell script

If you are not using AliRoot interactively, but you are instead using
it from a script, you cannot "enter" the AliRoot environment by
opening a new shell: you need to load the appropriate environment
inside the *current* shell.

This is how you do that:

```bash
eval `alienv printenv VO_ALICE@AliRoot::vAN-20141006`
```

Please note that those quotes are **backticks** and not ordinary
single quotes!

> **Do not do that if you are using AliRoot interactively!** Use
> the "enter" command instead!

For instance, inside a script:

```bash
#!/bin/bash
export AliRootVersion=vAN-20141006
export OutDir=/tmp/aliroot-outdir
mkdir -p "$OutDir"
cd "$OutDir" || exit 1

# this is the relevant line loading the environment: mind the backticks!
eval `alienv printenv VO_ALICE@AliRoot::$AliRootVersion`

# check if env has been loaded properly (maybe you picked a wrong AliRoot version?)
which aliroot || exit 1

cat > MyMacro.C <<EOF
void MyMacro() {
  // do something
}
EOF

exec aliroot -b -q MyMacro.C++g
```
