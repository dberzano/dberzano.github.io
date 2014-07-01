---
title: "ALICE Git tutorial"
layout: tweet

createtoc: true
parnumbers: true
---


Git is "complicated"
--------------------

[Git](http://git-scm.com/) is a very powerful Version Control System:
many important projects use it (*e.g.* the
[Linux Kernel](http://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git)).

Version Control Systems are used for keeping track of the
modifications of a software project: it is a sort of "time machine"
allowing us to see *what* changed, *who* changed it and *when*.

Among many different Version Control Systems, Git's most distinctive
feature is that it is *distributed*: this practically means that every
developer has a full copy of the software repository, including the
history of changes, on her own computer, which can be considered as
a "natural backup".


### A phenomenological approach

If you are reading this tutorial, you are probably a beginner to Git.

What you want to attain sounds simple:

* keep your software's local copy up-to-date with other people's
  changes
* write your own code
* make your code public

What you **do not ever** want to attain is even clearer:

* you do not want to make a disaster
* you do not want to lose your code

Git is an extremely powerful tool: it is complicated to get concepts
such as the workflows, but on the other hand it is very simple to
understand the basics and keep your code safe.

> Bear in mind that this guide favors *avoiding* disasters over
> *recovering* from them. Stick to the examples and nothing bad will
> happen.


### Git workflows

Given the power of Git, many developers and experts have produced tons
of documentation on the so-called *workflows* (see for example
[GitHub](https://guides.github.com/introduction/flow/index.html),
[Gitflow](http://nvie.com/posts/a-successful-git-branching-model/) and
[Anar Manafov's model](https://github.com/AnarManafov/GitWorkflow/blob/master/GitWorkflow.markdown)).

They all stress different Git concepts and come up with a set of good
practices and enforced rules.

**We will not suggest or endorse, implicitly or explicitly, any Git
workflow with this tutorial.** We believe that you must learn how the
basic stuff works before diving into workflow concepts.


Before you begin
----------------

You must have Git on your computer. In addition, we recommend you have
`git-new-workdir` and `tig` installed.


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
