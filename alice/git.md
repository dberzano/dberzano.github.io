---
title: "ALICE Git tutorial"
layout: tweet

createtoc: true
parnumbers: true
---


Recommended software
--------------------

### git-new-workdir

[git-new-workdir](http://nuclearsquid.com/writings/git-new-workdir/)
creates new directories for different Git branches without wasting too
much space.

On Linux and Mac *(you need root permissions)*:

```bash
sudo curl -L https://raw.github.com/gerrywastaken/git-new-workdir/master/git-new-workdir -o /usr/bin/git-new-workdir
sudo chmod +x /usr/bin/git-new-workdir
```

### tig

[tig](http://jonas.nitro.dk/tig/manual.html) is a visual tool running
in your terminal to better understand the status of your Git
repository.

On Ubuntu:

```bash
sudo apt-get install tig
```

On Mac (with [Homebrew](http://brew.sh/)):

```bash
brew install tig
```


Resources
---------

* [SVN basic commands to Git commands](http://aliceinfo.cern.ch/Offline/node/2912)
* AliRoot CERN Git repository:
 * Read-only: `http://git.cern.ch/pub/AliRoot`
 * Write access: `https://git.cern.ch/reps/AliRoot`
 * [Web interface](https://git.cern.ch/web/AliRoot.git)
