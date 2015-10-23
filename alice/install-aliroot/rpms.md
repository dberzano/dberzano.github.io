---
title: "Install RPMs using Yum"
layout: tweet

createtoc: true
parnumbers: true
---

If you are running a RPM-based distribution, such as Scientific Linux, you can
now get the same versions of ALICE software we deploy on the Grid via Yum.

> RPM support is currently under testing. Only tagged AliPhysics versions are
> available for now.


Install the CERN CA certificate
-------------------------------

Our packages are downloadable from a HTTPS server whose certificate is signed by
CERN. This is to ensure that data transferred during package download does not
get tampered by a third party.

You need to have the CERN Certification Authority certificates installed on your
machine in order to use our RPMs. If you are running Scientific Linux CERN, or
CERN CentOS, you should have them installed already. Check with:

```bash
rpm -q CERN-CA-certs || yum install CERN-CA-certs
```

Alternatively, from CentOS/RHEL 6 on, you can use the following sequence:

```bash
curl -o /etc/pki/ca-trust/source/anchors/CERN_Grid_CA.pem \
     https://cafiles.cern.ch/cafiles/certificates/CERN%20Grid%20Certification%20Authority.crt && \
update-ca-trust enable && \
echo "all ok"
```

You should see `all ok` if everything went right. If this does not work for you,
there is some [extensive
documentation](https://www.happyassassin.net/2015/01/14/trusting-additional-cas-in-fedora-rhel-centos-dont-append-to-etcpkitlscertsca-bundle-crt-or-etcpkitlscert-pem/)
on the web.

The link where you can manually download the CERN Grid CA certificate is
[here](https://cafiles.cern.ch/cafiles/certificates/Grid.aspx).


Configure the ALICE Yum repository
----------------------------------

As root, you can create the repository file by copying-pasting the following
lines to your prompt:

```bash
cat > /etc/yum.repos.d/alisw-el5.repo <<EOF
[alisw-el5]
name=ALICE Software - EL5
baseurl=https://ali-ci.cern.ch/repo/RPMS/el5.x86_64/
enabled=1
gpgcheck=0
EOF
```


List, install, remove packages
------------------------------

In order to avoid conflicts with other software installed on your system, ALICE
packages are fully installed under `/opt/alisw` and no other directory is
affected. Moreover, you will need to enable the "environment" for running them
explicitly.

All ALICE package names are prefixed with `alisw`, so, once you have installed
the repository manifest, you can simply do:

```bash
yum search alisw
```

or, to list all AliPhysics versions:

```bash
yum search alisw-AliPhysics
```

To install a certain version:

```bash
yum install alisw-AliPhysics+vAN-20151013-1
```

All dependencies are installed automatically.

Do not remove packages by deleting the /opt/alisw directory! Instead, use Yum:

```bash
yum remove alisw-AliPhysics+vAN-20151013-1
```

Recent RHEL/Fedora/etc. versions have a better remove that uninstalls dangling
dependencies, so it is actually recommended doing:

```bash
yum autoremove alisw-AliPhysics+vAN-20151013-1
```

Installed ALICE packages can be listed by using the following command:

```bash
rpm -qa | grep ^alisw
```

You can also remove every ALICE package installed by typing:

```bash
rpm -qa | grep ^alisw | xargs -L1 --no-run-if-empty yum remove -y
```


Use installed ALICE software
----------------------------

ALICE software is not "loaded" or "enabled" automatically on your environment:
you need to enable it explicitly.

Once for all, configure your `.bashrc` in order to export the following
variable:

```bash
export MODULEPATH=/opt/alisw/el5/modulefiles:$MODULEPATH
```

Exit and re-enter your shell (or re-source your `.bashrc) when done.

Loading the environment uses [Environment
Modules](http://modules.sourceforge.net/), which makes it very easy to load and
unload environment configurations. Please refer to its documentation for an
exhaustive explanation. A quick guide follows.

List all available software:

```
modulecmd bash avail
```

Load a certain version of AliPhysics from the list of available modules:

```bash
eval $(modulecmd bash load AliPhysics/vAN-20151013-1)
```

Note that this affects the current shell only. All dependencies are loaded
automatically.

You can also list the modules currently loaded in the current shell:

```bash
modulecmd bash list
```

And finally you can unload a module (and its dependencies):

```bash
eval $(modulecmd bash unload AliPhysics/vAN-20151013-1)
```

> `modulecmd` takes the shell type as first argument: if you do not use Bash,
> you can type your shell name instead, such as `ksh` or `csh`.
