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


## Convert existing documentation to Doxygen

In order to help converting the existing comments to Doxygen, by especially
taking into consideration [special ROOT data member comments](#data_members), we
provide a very spartan tool called `thtml2doxy.py`.


### Prerequisites for thtml2doxy.py

In order to use this tool, you need to have AliRoot Core installed (*i.e.* with
`make install`) and an environment properly set. If you follow the [installation
instructions](../install-aliroot) then you are set.

The conversion tool uses the Python bindings of
[libclang](http://clang.llvm.org/doxygen/group__CINDEX.html), which must be
installed on your system.

The tool has been solely tested using LLVM 3.5 on Ubuntu 14.04, and libclang has
been installed like this:

```bash
aptitude instsall libclang1-3.5 libclang-common-3.5-dev
```


### How to use it: an example

We are assuming that AliRoot has been installed. Let's take a couple of files as
examples:

* TPC/TPCcalib/AliTPCcalibBase.cxx
* TPC/TPCcalib/AliTPCcalibBase.h

First off, move to their directory in the source code:

```bash
cd "$ALICE_ROOT/../src/TPC/TPCcalib"
```

Look at the beginning of the .cxx file:

```
///////////////////////////////////////////////////////////////////////////////
//                                                                           //
//  Base class for the calibration components using
//  as input TPCseeds and ESDs
//  Event loop outside of the component
//
//
// Base functionality to be implemeneted by component
/*
   //In some cases only one of this function to be implemented
   virtual void     Process(AliESDEvent *event)
   virtual void     Process(AliTPCseed *track)
   //
   virtual Long64_t Merge(TCollection *li);
   virtual void     Analyze()
   void             Terminate();
*/
// Functionality provided by base class for Algorith debuging:
//  TTreeSRedirector * cstream =  GetDebugStreamer() - get debug streamer which can be use for numerical debugging
//



//  marian.ivanov@cern.ch
//
```

Now run the conversion tool:

```bash
thtml2doxy.py -I$ALICE_ROOT/include AliTPCcalibBase.cxx AliTPCcalibBase.h
```

The two files have been modified in place. Your directory is under version
control with Git, so you can:

* check the differences: `git diff`
* revert changes if you don't like them: `git checkout <filename>`
* commit your changes: `git add <filename>`

> Do not commit immediately without checking what has changed! You'll likely
> need to amend some of the automatic conversions!

We immediately notice that the new header looks like this:

```
/// \class AliTPCcalibBase
/// \brief  Base class for the calibration components using
///
/// as input TPCseeds and ESDs
/// Event loop outside of the component
///
/// Base functionality to be implemeneted by component
///
///  //In some cases only one of this function to be implemented
///  virtual void     Process(AliESDEvent *event)
///  virtual void     Process(AliTPCseed *track)
///
///  virtual Long64_t Merge(TCollection *li);
///  virtual void     Analyze()
///  void             Terminate();
///
/// Functionality provided by base class for Algorith debuging:
/// TTreeSRedirector * cstream =  GetDebugStreamer() - get debug streamer which can be use for numerical debugging



//  marian.ivanov@cern.ch
//
```

In particular:

* the `\brief` line is broken
* the example code block is not marked as such
* the author was not converted (it belonged to a different comment block)

After a couple of manual edits, we make it look like this:

```
/// \class AliTPCcalibBase
/// \brief Base class for the calibration components using as input TPCseeds and ESDs
///
/// Event loop outside of the component
///
/// Base functionality to be implemeneted by component
///
/// ~~~{.cxx}
/// // In some cases only one of this function to be implemented
/// virtual void     Process(AliESDEvent *event);
/// virtual void     Process(AliTPCseed *track);
///
/// virtual Long64_t Merge(TCollection *li);
/// virtual void     Analyze();
/// void             Terminate();
/// ~~~
///
/// Functionality provided by base class for Algorith debuging:
///
/// ~~~{.cxx}
/// TTreeSRedirector * cstream =  GetDebugStreamer() - get debug streamer which can be use for numerical debugging
/// ~~~
///
/// \author Marian Ivanov <marian.ivanov@cern.ch>
```

We have:

* put the `\brief` on one line
* put fences around the code blocks by specifying the syntax (`~~~{.cxx}`), so
  that Doxygen will generate colored code
* converted the author's email to the recommended format

`thtml2doxy.py` takes as many files as you want as input. Remember to always
specify the "include path" `-I$ALICE_ROOT/include`, as this is required by
libclang.

As you can see from the example, the original documentation did not have a clear
convention, so a fully automated conversion is not possible. However, the
conversion tool saves you some time.

In fact, if you run `git diff`, you'll realize how the member functions comments
are converted correctly, the `\cond CLASSIMP ... \endcond` has been added, and
all data members have their description properly formatted.


### Images from ROOT macros

With ROOT's THtml it was possible to insert a special macro block generating an
image. ROOT internally processed the macro, and the resulting HTML contained the
image only.

Whenever `thtml2doxy.py` finds a block in the form *(case insensitive)*:

```
BEGIN_MACRO
...
END_MACRO
```

the macro is extracted to an external file in the directory `imgdoc` under the
current path.

If the input file is, *i.e.*, `AliTPCGGVoltError.h`, all macros found in the
file will be extracted to `imgdoc/AliTPCGGVoltError_h_<uuid>.C`.

The code block corresponding to the macro will be substituted with a pointer to
a static image, in Markdown format:

```
![Picture from ROOT macro](AliTPCGGVoltError_h_<uuid>.png)
```

See [how to insert images from ROOT macros](#images_from_root_macros) for more
information.


### LaTeX blocks from ROOT macros

LaTeX blocks in the form *(case insensitive)*:

```
BEGIN_LATEX
...
END_LATEX
```

are also automatically converted to the
[corresponding Doxygen Markdown format](#latex_formulas). The special ROOT
"pound sign" syntax (*i.e.* `#sigma`) is automatically converted to the native
LaTeX syntax (`\sigma`).


### Adding your directories and images to Doxygen

AliRoot Doxygen is configured to look in a list of directories for files to
convert. Each single directory has to be specified, and the lookup is
non-recursive.

During the transition period, where not all the documentation has been converted
to Doxygen, this method helps us generating only the documentation for the files
that were actually converted to Doxygen.

To include your directory to the Doxygen documentation, edit the file
`doxygen/Doxyfile.in` and add your module's directory to the `INPUT` variable,
*e.g.*:

```bash
INPUT = @CMAKE_SOURCE_DIR@/doxygen \
        @CMAKE_SOURCE_DIR@/TPC \
        @CMAKE_SOURCE_DIR@/TPC/Attic \
        @CMAKE_SOURCE_DIR@/TPC/Base/test \
        @CMAKE_SOURCE_DIR@/TPC/Cal \
        @CMAKE_SOURCE_DIR@/TPC/CalibMacros \
        @CMAKE_SOURCE_DIR@/TPC/DA \
        @CMAKE_SOURCE_DIR@/TPC/fastSimul
```

If you have images to add in the `imgdoc` directory under your module's
directory, you should add it to the image search path in the same file:

```bash
IMAGE_PATH = @CMAKE_SOURCE_DIR@/picts \
             @CMAKE_SOURCE_DIR@/TPC/TPCbase/imgdoc
```

Probably you do not have push permissions for the `doxygen` directory, so just
[open a JIRA ticket](https://alice.its.cern.ch/) and attach
[the patch created with `git format-patch`](../git/#create_patch_files_and_import_them) to the issue.
