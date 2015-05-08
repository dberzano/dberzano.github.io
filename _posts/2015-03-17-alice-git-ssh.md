---
title: Using Git over SSH
createtoc: true
---

Many ALICE users are suffering from poor Internet connections at their place:
this is impairing when attempting to clone the AliRoot and AliPhysics
repositories via HTTP using the ordinary URLs:

* **Pull only:** http://git.cern.ch/pub/AliRoot
* **Push and pull (requires auth):** https://git.cern.ch/reps/AliRoot

CERN IT is providing an experimental Git-over-SSH service that should help
working around connection issues. Users must be in the egroup **alice-git-ssh**
in order to be allowed to do that.

Here's how to subscribe to the service, and how to use it.

> Bear in mind that the service is still experimental!


### Subscibe to the service

You cannot subscribe yourself to **alice-git-ssh**. Create a JIRA Issue from
[here](https://alice.its.cern.ch/):

* **Project:** Git administration
* **Issue type:** Task
* **Summary:** Add user _your-user-name_ to alice-git-ssh
* **Assignee:** Dario Berzano (don't forget to assign the ticket!)

Then just press **Create** and ignore the other fields. You will receive email
confirmations when the task is done.


### Configure the new URL for an existing clone

Go to your AliRoot or AliPhysics source directory - we will use `$ALICE_ROOT` in
the examples, substitute it with `$ALICE_PHYSICS` wherever appropriate, and set
the new remote URL:

* **AliRoot**: ssh://git.cern.ch/AliRoot
* **AliPhysics**: ssh://git.cern.ch/AliPhysics

To do that:

```bash
cd $(dirname "$ALICE_ROOT")/src
git remote set-url origin ssh://<YOUR_CERN_USERNAME>@git.cern.ch/AliRoot
```

> Substitute `<YOUR_CERN_USERNAME>` with your CERN username!


### Use the new URL for a new clone

Clone AliRoot:

```bash
mkdir -p "$ALICE_PREFIX"/aliroot/git/
git clone ssh://<YOUR_CERN_USERNAME>@git.cern.ch/AliRoot "$ALICE_PREFIX"/aliroot/git/
```

then proceed with rest of the operations described
[here](/alice/install-aliroot/manual/#clone_and_configure_your_git_repository):
do everything except the clone, which we have just done.

The procedure is the same for AliPhysics:

```bash
mkdir -p "$ALICE_PREFIX"/aliphysics/git/
git clone ssh://<YOUR_CERN_USERNAME>@git.cern.ch/AliPhysics "$ALICE_PREFIX"/aliphysics/git/
```

> Substitute `<YOUR_CERN_USERNAME>` with your CERN username!


### Getting the updates ("pull")

The automatic script used as-is will fail, as it requires you to interactively
type your CERN login password.

If you want to perform an upgrade, you need to do the `git pull` manually, then
tell the automatic installation **not** to download.

For AliRoot, for instance:

```bash
cd "$ALICE_ROOT"/../src/
git pull
# your CERN password will be requested
```

then proceed with the automatic installation:

```bash
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --aliroot --no-download
```

It's the same for ALiPhysics:

```bash
cd "$ALICE_PHYSICS"/../src/
git pull
# your CERN password will be requested
bash <(curl -fsSL http://alien.cern.ch/alice-installer) --aliphysics --no-download
```


### Using Git-over-SSH from outsice CERN

The experimental Git-over-SSH service provided by CERN IT is not accessible from
outside CERN network. If you are using it from outside CERN, you can use a SSH
tunnel from lxplus to use the service.

One way of doing that is creating, or editing, your `~/.ssh/config` file by
adding appropriate tunneling configurations:

```
Host lxplus.cern.ch
  LocalForward 62222 git.cern.ch:22
  ServerAliveInterval 60
  User <your_cern_username>

Host git.cern.ch
  HostName localhost
  Port 62222
  User <your_cern_username>
```

You don't need to change Git's URL: `ssh://git.cern.ch` will still be valid
thanks to the SSH configuration file.

To use the forward, you need to **SSH to lxplus first**:

```bash
ssh lxplus.cern.ch
```

A tunnel pointing local port 62222 to port 22 of git.cern.ch will be
automatically created. You must keep your shell on lxplus open in order to work
with Git-over-SSH.


### Use your SSH key to login (experimental)

In principle you can map a SSH _public_ key to your CERN account, and use it for
accessing the service without typing any password.

Create a SSH key pair:

```bash
ssh-keygen -t rsa -b 2048 -f ~/.ssh/id_rsa-cern-git-ssh
```

> Do not provide any passphrase if you intend to login non-interactively!

Now edit your `~/.ssh/config` (create one if it does not exist). Add (respect
indentation):

```bash
Host git.cern.ch
  User <YOUR_CERN_USERNAME>
  IdentityFile ~/.ssh/id_rsa-cern-git-ssh
  UserKnownHostsFile /dev/null
  StrictHostKeyChecking no
```

You now need to point your browser to
[this page](https://resources.web.cern.ch/resources/Manage/Accounts/Settings.aspx),
and register your SSH key as displayed: 

![Register your SSH key](/images/posts/cern-ldap-register-ssh-key.png)

You will have to upload the content of `~/.ssh/id_rsa-cern-git-ssh.pub`: note
the **.pub** at the end! This is the **public key**, while the other (the one
without the ending .pub) **must be kept private and not sent to anyone!**

You should now be able to perform all fetch operations like `git pull` or
`git clone` without needing your password.
