---
title: "Doxygen documentation guidelines for AliRoot and AliPhysics"
layout: tweet

createtoc: true
parnumbers: true
---

## How to write Doxygen documentation

AliRoot Core and AliPhysics use [Doxygen](http://www.doxygen.org/) for
documentation.

Doxygen is a way of documenting your code *inside* the source code itself, by
factoring special comments that will be ignored by the C++ compiler.


### Documenting a C++ class

A C++ class is divided in two files:

* the header file, with the class definition (*e.g* `AliMyClass.h`)
* a source file, with the class implementation (*e.g* `AliMyClass.cxx`)


#### Class description

At the very beginning of your **header** file, put the following specially
formatted comment:

```{c++}
/// \class AliMyClass
/// \brief This is a brief description of my class
///
/// This is a longer description of the class. This longer description is
/// formatted using the Markdown syntax (see below) and can span on multiple
/// lines.
///
/// Separate the paragraphs by leaving a blank line between them.
///
/// \author Alice User1 <alice.user1@cern.ch>, My Home Institute
/// \author Alice User2 <alice.user2@cern.ch>, My Home Institute
/// \date Mar 4, 2015
```

Notes:

* The `\brief` command is meant to be a short description of the class, so
  please **keep it short** (say, under 80 characters). It will be displayed next
  to the file in the Doxygen list of files.
* There can be multiple `\author` lines, one for each author. Please respect the
  suggested format, including the valid email and the home institute. First name
  first, then last name.
* The `\date` field is optional. To keep things clear, please stick to the
  suggested format: `Mmm dd, YYYY` where `Mmm` is the three-letters English
  abbreviation for the month. Use letters for the month to avoid ambiguities
  between different date formats and orders.

> Leave the class description inside your header file only. **Do not duplicate
> it** inside the source file!


#### Data members

As you know, ROOT uses specially formatted comments for datamembers, to know
what to do when saving a class instance to a file. For instance,

```{c++}
Int_t fThisIsTransient;  //! This is a member's description
```

the `//!` comment tells ROOT not to save this datamember when saving the class
instance to a file.

Doxygen uses specially formatted comments as well: **you have to be careful** in
order to avoid conflicts between what ROOT and Doxygen understand.

Here we cover the most common cases. The `fRoot` variable is the one with the
ROOT-only comment. The `fDoxygen` variable has the ROOT-compatible Doxygen
comment (*i.e.*  the one you should use).

**Normal members:**

```{c++}
Int_t fRoot;     // Description
Int_t fDoxygen;  ///< Description
```

**Transient members:**

```{c++}
Int_t fRoot;     //! Description
Int_t fDoxygen;  //!< Description
```

**Arrays:**

```{c++}
Int_t *fRoot;     //[fSize] Description

/// Description
Int_t *fDoxygen;  //[fSize]
```

**Note:** in this case, the ROOT comment is left alone, and the member
description is prepended to the member definition.


**Don't split member on multiple files:**

```{c++}
TTree *fRoot;     //|| Description

/// Description
TTree *fDoxygen;  //||
```

Also in this case the comment has to be split into a Doxygen comment and a ROOT
one.


**Pointer to TObject:**

```{c++}
TObject *fRoot;     //-> Description

/// Description
TObject *fDoxygen;  //->
```

Comment is split here too.


#### Member functions

Member functions (apart some exceptions) are implemented in the source file. In
Doxygen, a member function is documented like the following:

```{c++}
/// This is the description of this member function. It can contain Markdown
/// code.
///
/// Multiple paragraphs are split on multiple lines.
///
/// \param anInt Integer value used to do things
/// \param aTree Pointer to a valid TTree
///
/// \return A fixed number that has nothing to do with what the function does
Float_t AliMyClass::MyMemberFunction(Int_t anInt, TTree *aTree) {
  /* implementation goes here */
  return 123.45;
}
```

The same Markdown code can be used for formatting this comment. Please note the
special Doxygen tags:

* Use one `\param` per function parameter to document it (keep them brief!)
* Use the `\return` command to document the return value (keep it brief!)

> Our current convention is to place function description **before** method
> definition and **not** inside it.


### Documenting a C++ "macro"

Suppose we have the `AliMyMacro.C` ROOT C++ macro. At the very beginning of the
file:

```{c++}
/// \file AliMyMacro.C
/// \brief This is a brief description of my file, pretty much like the class
///
/// Multiple paragraphs separated by blank lines.
///
/// Considerations for documenting classes apply here too.
///
/// \author Alice User1 <alice.user1@cern.ch>, My Home Institute
/// \author Alice User2 <alice.user2@cern.ch>, My Home Institute
/// \date Mar 4, 2015
```

Macros are documented [the same way classes are
documented](#documenting_a_c_class). The only difference:

* The `\file` parameter is followed by the file name
* `\date` is optional like in classes


### ClassImp() and ClassDef()

The special ROOT macros `ClassImp()` and `ClassDef()` can create confusion to
Doxygen.

To reduce confusion:

* wrap them in a special `\cond` block
* terminate them with a `;` like for ordinary C++ code, even if it's not
  mandatory for ROOT

In the class definition:

```{c++}
/// \cond CLASSIMP
ClassImp(AliMyClass);  // notice the ;
/// \endcond
```

In the source file:

```{c++}
/// \cond CLASSIMP
ClassDef(AliMyClass, 0);  // notice the ;
/// \endcond
```

The `CLASSIMP` variable is used both for `ClassImp()` and `ClassDef()`
definitions, it is not a typo.


### Markdown

Comments are formatted using Markdown syntax. The Markdown syntax is extensively
described [here](http://daringfireball.net/projects/markdown/syntax).

In particular:

```
**This text will be bold**, whereas *this will be italic*.

[This is a link](http://aliceinfo.cern.ch/).

* This is
* A list
  * with a sublist
  * of other items

![This is an image](image.png)

## This is a title for a section

### This is a title for a subsection

#### This is a title for a subsubsection
```


### Images from ROOT macros

In ROOT it was possible to generate images from ROOT macros on the fly by using
the `Begin_Macro ... End_Macro` block.

If you are working in a file named `MODULE/SUBMODULE/AliMyClass.cxx`, first
create a subdirectory called `imgdoc`:

```
mkdir MODULE/SUBMODULE/imgdoc
```

In there, create a macro file named `AliMyClass_cxx_whateveryouwant.C`, and fill
it with the content of the ROOT macro block.

Replace the macro block with:

```
![Whatever you want](AliMyClass_cxx_whateveryouwant.png)
```

In practice you are inserting an image that has the same name of the macro, but
the `.png` extension in place of `.C`.

> Do not use absolute paths there. Only point to the image file name with no
> path at all.

To generate the file, load the AliRoot environment (*i.e.* you must have
AliRoot working in your path), go to the `MODULE/SUBMODULE/imgdoc` directory and
run:

```bash
cd <AliRootSource>/MODULE/SUBMODULE/imgdoc
alidoxyimg.sh AliMyClass_cxx_whateveryouwant.C
```

The corresponding updated `.png` file will be created.

> Remember to `git add` and `commit` **both** the macro file and the generated
> image! If editing the macro, **regenerate the image**.


### LaTeX formulas

ALICE Doxygen documentation uses [MathJax](http://www.mathjax.org/) for
rendering formulas natively in the browser: this means that formulas can be
inserted in the code in the native LaTeX syntax, and no intermediate image will
be generated.

Doxygen supports two types of LaTeX blocks. Inline formulas are written on a
single line:

```
... \f$ latex_formula_goes_here \f$ ...
```

Formulas can be written in a separate block (clearer for long formulas):

```
\f[
...
...
...
\f]
```



## Generate the documentation

Before pushing any documentation change, you might want to check how it looks on
your local computer.

Generating Doxygen documentation is easy, and the tools you need are very
straightforward to install.


### Install required tools

Apart from the usual
[build tools](../install-aliroot/manual/#system-wide_prerequisites), you will
need:

* Doxygen
* Graphviz

On Ubuntu/Debian:

```bash
aptitude install doxygen graphviz
```

On OS X with Homebrew:

```bash
brew install doxygen graphviz
```


### Run Doxygen

You don't even need to compile AliRoot or ROOT to install the documentation.

If you follow the [installation instructions schema](../install-aliroot/manual),
once your environment is loaded (the `alice-env.sh` file):

* download AliRoot as described (`git clone`, `git-new-workdir`, etc.)
* move into the build directory
* run CMake as usual
* **no need to run `make`**: if you don't want to build, stop here

Now, inside the build directory, run:

```bash
make doxygen
```

Doxygen documentation will be generated in the build directory under
`doxygen/html`. Open `doxygen/html/index.html` with a web browser to read the
documentation.

If you get the error:

```console
$> make doxygen
make: *** No rule to make target `doxygen'.  Stop.
```

it means that CMake did not find Doxygen and Graphviz installed on your system.
If you have installed them and you still get the error, remove the build
directory and run CMake from scratch.

If you want the documentation to be installed in your AliRoot Core installation
directory (*i.e.* `$ALICE_ROOT`), type:

```bash
make install-doxygen
```

Open `$ALICE_ROOT/doxygen/index.html` to browse the documentation.
