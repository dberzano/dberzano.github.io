---
title: "Basic code debugging"
layout: tweet

createtoc: true
parnumbers: true
---


Preparing your code for debug
-----------------------------

When compiling a piece of software you can normally choose between:

* a **release** build
* a **debug** build

This also applies for ROOT, AliRoot and your analysis code. As the
name suggests, **release** or **production** builds should be used
when deploying your code, while **debug** builds should be used to
inspect and find problems in your code.

There are two main correlated characteristics that differ between
release and debug builds:

* compile-time optimization
* debug symbols


### Compile-time optimization

Every compiler performs some sort of optimization while producing
executables and libraries. Optimizing a code while compiling means
that the compiler does not merely *translate* a written programming
language into machine code, but it also tries to *interpret* up to a
certain extent what the code aims to do.

All levels of optimization have the result of avoiding unnecessary
code to be executed, and since optimization requires some code
analysis, the compilation time is longer.

Different levels of optimization can be choosen, ranging from no
optimization to *aggressive* optimization; for instance, with clang
and gcc you would use the following switches:

```
[-O0|-O1|-O2|-O3|-Ofast|-Os|-Oz|-O|-O4]
```

The default optimization level for the aforementioned compilers is
`-O2`: higher levels of optimization are normally not recommended, as
they might alter the program flow to a point it does no longer match
programmer's intentions.

A list of what each `-O` flag enables is available on the
[GCC documentation](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html#Optimize-Options).

When debugging code, you want the binaries to match as much as
possible the readable code: this is one of the reasons why
optimization must be turned off in such a case.


### Symbols and debug symbols

Shared libraries and executables contain binary code divided into
"sections", and "symbols" are a way of referring to such sections.
Each function or method name of your code is translated into a
symbol.

Extra "symbols" are written to a library when compiling in debug mode,
pointing directly fragments of functions to the corresponding lines in
the source code.

To compile with clang or gcc with debug symbols, you would use the
`-g` switch: there is no guarantee that optimizations are also turned
off, so you'd better specify also `-O0`:

```bash
gcc -O0 -g ...
```

The same flags are used for `clang`.


### Compiling your ALICE code for debug

When compiling the AliRoot framework or your analysis, you never
directly use the compiler.


#### ROOT

When [configuring ROOT](../install-aliroot/manual/#root), you must add
the `--build debug` flag:

```bash
cd "$ROOTSYS"
./configure --build debug \
  # other config options
make
```

> If ROOT has already been compiled **without** the debug option, you
> **must** run `make clean` before reconfiguring it!


#### AliRoot

By default, if you follow
[the instructions](../install-aliroot/manual/#configure_and_build_aliroot),
AliRoot is built with debug symbols, but with optimization turned on.

For building AliRoot for production (`-O3` optimization and no debug
symbols, like on the Grid):

```bash
cmake -DCMAKE_BUILD_TYPE=Release \
  # other cmake options
```

For explicitly setting the debug mode (which, as we have seen, is the
default):

```bash
cmake -DCMAKE_BUILD_TYPE=Debug \
  # other cmake options
```

This implies building with `-g -O0`.

AliRoot needs to be recompiled (via `make`) after changing the build
type.


#### Your analysis

Suppose your analysis task is called `AliAnalysisTaskDummyTask`. In
the macro you use to load the analysis task, you can do:

```c++
gROOT->LoadMacro("AliAnalysisTaskDummyTask.cxx++g");
```

The "double plus" forces recompilation, while the appended `g` tells
ROOT to compile the task with debug symbols. Once your code is in
production, just remove the `g`:

```c++
gROOT->LoadMacro("AliAnalysisTaskDummyTask.cxx++");
```

Please note that debug code is considerably slower than production
code, although it provides you with more information (for instance
line numbers in stacktraces as we will see later).

> Only use debug builds for temporary tests: turn off debugging when
> sending your code to production!


#### Check if you have compiled with debug symbols (Linux)

To check if your code has been compiled with debug symbols, on Linux
you can do:

```bash
nm -a libName.so | grep debug
```

The `nm -a` command lists all symbols: we grep only the ones
containing the word "debug". For instance:

```bash
$> cd $ALICE_BUILD/lib/tgt_*
$> objdump --syms libPWGEMCAL.so
0000000000000000 l    d  .debug_aranges	0000000000000000              .debug_aranges
0000000000000000 l    d  .debug_info    0000000000000000              .debug_info
0000000000000000 l    d  .debug_abbrev  0000000000000000              .debug_abbrev
0000000000000000 l    d  .debug_line    0000000000000000              .debug_line
0000000000000000 l    d  .debug_str     0000000000000000              .debug_str
0000000000000000 l    d  .debug_loc     0000000000000000              .debug_loc
0000000000000000 l    d  .debug_ranges  0000000000000000              .debug_ranges
```

The library `libPWGEMCAL.so` on our reference Linux installation
**does contain** debug symbols. The above command usually contains
no output if no debug symbols are present.

Please note that on OS X debug symbols do not show up with `nm -a`.


Some general programming tips
-----------------------------

In order to reduce as much as possible the amount of time spent
debugging and making your code faster, here are some general tips you
might find useful.


### Use existing algorithms for general problems

A large portion of coding problems applied to data collections can be
reduced to **sorting** or **searching**: even if a simple custom made
array sorting code looks innocuous and easy to read, when iterating
over a collection of thousands or millions of elements its drawbacks
become pretty obvious.

As a general rule, **do not write your own sorting algorithms**:
standard ROOT data collections, like [TLists](http://root.cern.ch/root/html/TList.html)
and [TObjArrays](http://root.cern.ch/root/html/TObjArray.html),
already have an efficient `Sort()` method.

Moreover, if you are manually filling a TList for sorting it at a later
time, consider using something like the [TSortedList](http://root.cern.ch/root/html/TSortedList.html),
which is compatible with a TList, *i.e.* you can do:

```c++
TList *mySortedList = new TSortedList();
```

but objects are inserted in the correct order every time you `Add()`
them, avoiding additional time waste to order it at a later time.

The same considerations apply for **searching algorithms**: ROOT
already have search functions optimized for its data structures, and
if you search in a sorted list (like the TSortedList), search is
faster.

Searching by strings inside large collections **must be avoided at all
times**: string comparison is a very expensive operation, and it is
not easy to estimate how long it takes since it depends on the length
of the compared strings. Massive string comparison, even if this is
unobvious, leads to:

* **large data transfers** between CPU, caches and memory, hitting the
  bus limits
* **cache trashing**, *i.e.* the constant invalidation of the caches
  that are supposed to speed up code execution

A bad example that uses massively string comparisons has been found
inside ROOT thanks to the IgProf profiler, and the code has been
amended, as we will see later on.

To improve lookups in large collections, please consider
[THashList](http://root.cern.ch/root/html/THashList.html) instead
of TList: a "hash" is a fixed-size byte sequence (usually an integer)
associated to each element and computed based on the content of the
element, constituting a sort of "fingerprint".

When performing a lookup on a hash list (*i.e. find what element is
identical to this one, or find what element has this name*), the
hash ("fingerprint") of the input element is calculated, and it is
compared with the hash of every other element in the list.

If two hashes match, it *might* mean that the two elements are
identical: in this case, and this case only, a deep check is performed
and the response is returned.

The big advantage is that from a shallow (hash) comparison we can tell
for sure if two elements are different, which saves us the time
required to perform a deep comparison for every element.

> Use optimized versions of the algorithms even if they are difficult
> to understand, and **trust them**!

For a list of optimized general purpose algorithms in C and C++, have
a look at the [Numerical Recipes](http://www.nr.com/), which is
considered the "sacred text" of this field.


### Object ownership

Very often, the ownership of pointers is not clear, *i.e.* who created
a certain object, and who is responsible of garbage collecting it?

If you are the person defining a new object, be sure to do something
like:

```c++
AliMyObject *mo = new AliMyObject();
// code code code
delete mo;
```

You have probably heard it lots of times already, but it is worth
repeating it: write a `delete` every time you write a `new`, and think
in advance of how to dispose of an object *you* created.

ROOT collections (*i.e.* the TLists) can be made "owners" of objects:

```c++
TList *l = new TList();
l->SetOwner(kTRUE);
// add add add
delete l;
```

This means that when the code reaches the `delete` line, `delete` is
automatically invoked on each of the contained objects, so that you
do not have to do it manually.


### New and delete, and hidden memory operations

Please note that **new and delete operations are very slow**: never
ever create and destroy an object per loop (for instance inside the
`UserExec()` of the analysis tasks)!

> **Save memory and CPU, recycle objects!** And if the object classes
> are defined by you, write them in a way that you can **redefine**
> their content without the need to delete and recreate them!

A **bad example** with objects constructed per loop:

```c++
for(ip=0; ip<np; ip++) {
  for (in=0; in<nn; in++){
    TLorentzVector pos( f(ip) );
    TLorentzVector neg( f(in) );
    TLorentzVector comb = pos + neg;
    neg.Boost( -comb.GetBoostVector() );
    // ...
  }
}
```
<!-- -->

Even if `new` and `delete` are not used there (objects are on the
stack), the `TLorentzVectors` have their constructor and destructor
invoked **per loop!**

The amended code:

```c++
TLorentzVector pos;
TLorentzVector neg;
TLOrentzVector comb;

for(ip=0; ip<np; ip++) {
  for (in=0; in<nn; in++){
    pos.SetVect( f(ip) );
    neg.SetVect( f(in) );
    TLorentzVector comb = pos + neg;
    neg.Boost( -comb.GetBoostVector() );
    // ...
  }
}
```
<!-- -->

[As you can see](http://root.cern.ch/root/html/TLorentzVector.html),
the `TLorentzVector` has various `Set*()` methods that make it not
necessary to destroy and recreate the object to set new coordinates.

Also, **do not be too zealous when deleting**: in particular, do not
delete objects that do not belong to you. Common example: do not
delete the object if you get its pointer from a TFolder, as it should
be removed by those who posted it.

Choose the ROOT container carefully: even if a `TList` and a
`TObjArray` are both collections capable of expanding, **lists are
sparse** in memory, as each element points to the next (and sometimes
to the previous); instead, **arrays are contiguous collections of
elements** in memory.

Growing an array requires periodic **hidden** `realloc()` low level
operations (luckily they do not happen for every element we
add), and this might be rather impairing when applied to a very large
collection: use a `TList` in such a case.


### ROOT I/O and objects

A note about ROOT objects (*i.e.* objects inheriting from `TObject`,
*i.e.* most likely **your own** objects): ROOT as you know needs a
default constructor for I/O that takes no arguments. You should create
at least **two constructors** in your code for clarity:

* The default one, needed by ROOT, that should be called only by ROOT
  when storing or restoring object from a file, and should never be
  used by the programmer directly: **do not write any memory
  allocation there**, leave it as empty as possible!
* The "explicit" one, taking at least one argument, which should do
  the actual stuff and should be used by the programmer when creating
  a new object.

Objects obtained from a file with statements like:

```c++
TH1 *histo = (TH1F *)myFile->Get("myHist");
```

**must be disposed by you**, so you **must** destroy them when done:

```c++
delete histo;
```

### Compiler warnings

**Do not overlook compiler warnings!** Warnings should **never** exist
in a clean code.

Whenever you see a warning, you have to:

* **fix** the code, if it is actually broken: sometimes warnings get
  it right that you are doing something wrong
* **silence** the warning by rewriting the snippet in a way that it
  does not trigger the warning.

Different compilers give different warnings: clang is usually more
precise and tends to give you advice on either how to silence the
warning, or what you probably meant when writing the code. Of course a
compiler is a "stupid" piece of software and you should not always
follow literally its advice, but do not overlook it!


### When to use pointers

As a general rule, it is not always a good idea to use pointers to
objects as data members of your class. If objects are big you are
forced to use it, but for many small objects you'd better use the
object directly: you will save yourself (and the computer) a
new/delete operation for each one of them. This has an impact if you
have many small objects.

Remember to always initialize pointers used as data members: compilers
should raise warnings if you do not.

Many member pointers in custom classes are **transient**, *i.e.* they
should exist only in memory and they should not be written to a file.
So please mark every transient pointer with the appropriate special
ROOT comment `//!` (no spaces between the slash and exclamation mark):

```c++
class MyClass : public TObject {
  private:
    AnotherClass *transient_ptr;  //!
  // ...
}
```

> This is not just for aesthetics: you are telling ROOT **not to
> save** the pointer to file, considerably reducing the output size!


### Strings

A very very very bad habit found very frequently in analysis code is
referencing objects via their name inside the `UserExec()` (or any
other loop):

```c++
TH1I *h = list->FindObject("myHistoName");
```

The `FindObject()` function is very (very!) expensive, furthermore it
always returns the same pointer for a certain object: it surely makes
no sense to run it inside the `UserExec()`! Do this call **once**
during the initialization and use the **cached** result in the event
loop!

Also, avoid passing "raw" strings as arguments to functions. Don't do:

```c++
void MyClass::myfunc(TString a) {
  // ...
}
```

Do instead:

```c++
void MyClass::myfunc(const TString &a) {
  // ...
}
```

Note that in both cases you invoke it with:

```c++
myfunc("this is a string");
```

which means that you can update your code without changing the way
you call such functions.

Moreover, it is a **bad idea** to use strings as triggering options on
a method, like:

```c++
void MyClass::dosomething(const TString &what) {
  if (what == "this") {
    // ...
  }
  else if (what == "that") {
    // ...
  }
  else if (what == "something else") {
    // ...
  }
}
```

As we have seen, **string comparison is evil**. Use **enums** instead:

```c++
enum dowhat_t { THIS, THAT, SOMETHING_ELSE };

void MyClass::dosomething(const dowhat_t what) {
  if (what == THIS) {
    // ...
  }
  else if (what == THAT) {
    // ...
  }
  else if (what == SOMETHING_ELSE) {
    // ...
  }
}
```

The code is as readable, but much more efficient.


Where does my code crash?
-------------------------

When the code you are running "crashes", you are usually presented
with a **backtrace** or **stack trace** showing the nesting level of
the called functions plus some more or less "obscure" information.
Such backtrace can be more detailed if you have compiled your code
with debug symbols.

Consider the following backtrace:

```
 *** Break *** segmentation violation
 Generating stack trace...
 0x00000001191d3bdd in AliAnalysisTaskSE::Exec(char const*) (in libANALYSISalice.so) (AliAnalysisTask.h:118)
 0x0000000111df577f in TTask::ExecuteTask(char const*) (in libCore.5.so) + 383
 0x00000001110518ed in AliAnalysisManager::ExecAnalysis(char const*) (in libANALYSIS.so) (AliAnalysisManager.cxx:2323)
 0x0000000111061be8 in AliAnalysisSelector::Process(long long) (in libANALYSIS.so) (AliAnalysisSelector.cxx:164)
 0x0000000114aa824f in TTreePlayer::Process(TSelector*, char const*, long long, long long) (in libTreePlayer.5.so) + 895
 0x000000011105afd6 in AliAnalysisManager::StartAnalysis(char const*, TTree*, long long, long long) (in libANALYSIS.so) (AliAnalysisManager.cxx:1950)
 0x0000000111086153 in G__G__ANALYSIS_208_0_14(G__value*, char const*, G__param*, int) (in libANALYSIS.so) (G__ANALYSIS.cxx:4560)
 0x0000000112578881 in Cint::G__ExceptionWrapper(int (*)(G__value*, char const*, G__param*, int), G__value*, char*, G__param*, int) (in libCint.5.so) + 49
 0x000000011262185b in G__execute_call (in libCint.5.so) + 75
 0x0000000112621cbc in G__call_cppfunc (in libCint.5.so) + 860
 0x00000001125f563e in G__interpret_func (in libCint.5.so) + 5198
 0x00000001125e3a67 in G__getfunction (in libCint.5.so) + 5655
 0x00000001126e45db in G__getstructmem(int, G__FastAllocString&, char*, int, char*, int*, G__var_array*, int) (in libCint.5.so) + 4187
 0x00000001126db0cd in G__getvariable (in libCint.5.so) + 7341
 0x00000001125d82c2 in G__getitem (in libCint.5.so) + 402
 0x00000001125d3e92 in G__getexpr (in libCint.5.so) + 31458
 0x000000011265517c in G__exec_statement (in libCint.5.so) + 34988
 0x000000011265348d in G__exec_statement (in libCint.5.so) + 27581
 0x00000001125f8282 in G__interpret_func (in libCint.5.so) + 16530
 0x00000001125e3ab4 in G__getfunction (in libCint.5.so) + 5732
 0x00000001125d832f in G__getitem (in libCint.5.so) + 511
 0x00000001125d3e92 in G__getexpr (in libCint.5.so) + 31458
 0x000000011265517c in G__exec_statement (in libCint.5.so) + 34988
 0x00000001125ba885 in G__exec_tempfile_core(char const*, __sFILE*) (in libCint.5.so) + 1125
 0x00000001125ba416 in G__exec_tempfile_fp (in libCint.5.so) + 22
 0x000000011265e4ab in G__process_cmd (in libCint.5.so) + 9339
 0x0000000111e27674 in TCint::ProcessLine(char const*, TInterpreter::EErrorCode*) (in libCore.5.so) + 884
 0x0000000111d86fbd in TApplication::ProcessLine(char const*, bool, int*) (in libCore.5.so) + 2141
 0x0000000113d81be4 in TRint::HandleTermInput() (in libRint.5.so) + 676
 0x0000000111e5f11d in TUnixSystem::CheckDescriptors() (in libCore.5.so) + 317
 0x0000000111e68053 in TMacOSXSystem::DispatchOneEvent(bool) (in libCore.5.so) + 387
 0x0000000111de4d5a in TSystem::InnerLoop() (in libCore.5.so) + 26
 0x0000000111de4c58 in TSystem::Run() (in libCore.5.so) + 392
 0x0000000111d87cc4 in TApplication::Run(bool) (in libCore.5.so) + 36
 0x0000000113d8150c in TRint::Run(bool) (in libRint.5.so) + 1420
 0x000000010546c5a8 in main (in aliroot) (aliroot.cxx:113)
 0x00007fff8c4d75fd in start (in libdyld.dylib) + 1
 0x0000000000000001 in <unknown function>
```

This means that the program has crashed while running the function
`AliAnalysisTaskSE::Exec`, and in particular while executing the line
of code defined in `AliAnalysisTask.h` at line 113:

```
0x00000001191d3bdd in AliAnalysisTaskSE::Exec(char const*) (in libANALYSISalice.so) (AliAnalysisTask.h:118)
```

The function was in turn called by `TTask::ExecuteTask()`, and so on,
until we reach the first function called by the program.

Other lines carry obscure information:

```
0x0000000111e5f11d in TUnixSystem::CheckDescriptors() (in libCore.5.so) + 317
```

In this case, we know that the `CheckDescriptors()` function is
defined in `libCore.5.so` and the crash occurred at byte offset 317
calculated from the start of the compiled function inside the binary
library.

The difference in debug information is given by the fact that:

* AliRoot has been compiled **with debug information**: all AliRoot
  functions report the corresponding source file and line number
* ROOT has been compiled **without debug information**: all ROOT
  functions only report obscure offsets

> It is possible to mix non-debug and debug code, but we will obtain
> comprehensible information only for the latter.

In the following sections we will present two commonly used debugging
techniques: one very simple based on printouts, and another one based
on using a debugger (gdb).


### Debugging with "printf/cout"

The simplest way to understand what goes on in your code is to
introduce periodic printouts stating the value of some variables, or
simply indicating what the program is currently executing.

Please note that, while printouts may be useful, they surely clutter
your code if abused: so if you end up adding one printout per code
line, you'd better off with a debugger, as explained in the next
paragraph.

Apart from code cleanliness, printouts have a computational cost,
which might be non-negligible depending on the frequency of your
output: we are about to learn the appropriate way to add *discrete*
debug printouts to your code in a way that:

* we can turn them off when debug is over without additional
  computational costs
* we don't have to rewrite our code twice, one debug and one
  production version


#### The generic way

The simplest (and wrong) way to do it in C/C++ is the following:

```c++
// global variable
bool gPrintDebug = true;

void PrintDebug(const char *message) {
  if (gPrintDebug == false)
    return;
  std::cout << message << std::endl;
}

int main(int argn, char *argv[]) {
  PrintDebug("We are here");
  return 0;
}
```

The above snippet has a convenient `PrintDebug()` function, whose
output can be suppressed by simply setting the global variable
`gPrintDebug = false`.

However, the PrintDebug() function is called in any case, even if no
output will be produced, and this function call has a non-negligible
cost; moreover, the condition `if (!gPrintDebug)` must be tested every
time, which has another computational cost.

The correct way is to use C/C++ **preprocessor macros**. The simplest
way is to move the condition `if (!gPrintDebug)` from C++ to the
preprocessor:

```c++
#include <iostream>

//#define PRINT_DEBUG

#ifdef PRINT_DEBUG
void PrintDebug(const char *message) {
  std::cout << message << std::endl;
}
#else
#define PrintDebug(...) 0;
#endif

int main(int argn, char *argv[]) {
  PrintDebug("We are here");
  return 0;
}
```

If we compile the above snippet, no call to the print function will
ever be generated in the compiled code, because the condition is
evaluated at compile time by the **code preprocessor** (to be precise,
this happens *just before* compiling the code).

To enable print debug, you can either uncomment the `#define` line on
top, or compile the code with:

```bash
gcc -o prog -D PRINT_DEBUG prog.cxx
```

*i.e.* you can define the `PRINT_DEBUG` preprocessor variable on the
command line without modifying your code.

> There are fancier ways to use preprocessor macros for debug: this
> one is trivial and provided as an example.


#### The AliRoot way: AliDebug

AliRoot has a logging facility defined in
`STEER/STEERbase/AliLog.{h,cxx}`: there are different functions
defined there that allow you to add sensible printouts to your code,
and you should definitely use them instead of `cout` or `printf`.

The "functions" are preprocessor macros, and there is a variable
associated to each of them, determining whether the code for the
printout should be generated or not ar runtime:

| **Function**                 | **Variable**     |
|------------------------------|------------------|
| `AliDebug(level, message)`   | `LOG_NO_DEBUG`   |
| `AliInfo(message)`           | `LOG_NO_INFO`    |
| `AliWarning(message)`        | `LOG_NO_WARNING` |
| `AliError(message)`          | *none*           |
| `AliFatal(message)`          | *none*           |


By defining the `LOG_NO_*` variables (through `#define`, for instance)
it is possible to suppress all the related message outputs, but in a
way that the generated code is optimized as explained in the previous
paragraph.

Please note that:

* it is not possible to suppress error and fatal error messages
* you must use those macros in a class
* you must include `AliLog.h` for using them
* you can turn them on and off selectively per class

Consider the following minimal example (save it as `AliLogTest.h`):

```c++
//#define LOG_NO_INFO
#include "AliLog.h"

class AliLogTest : public TObject {
  public:
    AliLogTest() {
      AliInfoF("I am %s", "legend");
    };
  ClassDef(AliLogTest, 1);
};
```

Load it via the following `load.C` macro:

```c++
{
  gSystem->AddIncludePath("-I$ALICE_ROOT/include");
  gROOT->LoadMacro("AliLogTest.h++");
  AliLogTest a;
}
```

Run:

```bash
aliroot -q load.C
```

and see what happens if you *uncomment* the `LOG_NO_INFO` definition.

Note that in the above example we have used `AliInfoF()` instead of
`AliInfo()`. All the debug functions have a `F` version (for
*formatting*. They accept a format string just like `printf` (for
instance, `%s` for strings or `%d` for signed integers) and a variable
number of arguments.

The following functions produce the same output:

```c++
AliInfoF("I am %s", "legend");
AliInfo( Form("I am %s", "legend") );
```

but this does not mean that they are equivalent. For the usual
optimization reasons, a call to the second function with `LOG_NO_INFO`
defined would produce indeed *no output* and the code for printout
would not be generated, but the `Form()` snippet would run in any
case.

The `AliInfoF()` version instead does not even execute `Form()` if
the `LOG_NO_INFO` variable is defined.


### Using a debugger

[gdb](http://www.gnu.org/software/gdb/) is the GNU debugger. To
install it on Debian-based distributions (like Ubuntu):

```bash
aptitude update
aptitude install gdb
```

On OS X, the default debugger is the
[LLVM debugger (lldb)](http://lldb.llvm.org/).


#### Installing gdb on OS X

> It is recommended you get accustomed with lldb if you use a Mac,
> unless you need to use some gdb features not available in lldb.

Obtaining OS X is easy with Homebrew:

```bash
brew install gdb
```

At the end of the installation, here is the message printed by `brew`:

```
==> Caveats
gdb requires special privileges to access Mach ports.
You will need to codesign the binary. For instructions, see:

  http://sourceware.org/gdb/wiki/BuildingOnDarwin
```

This means in practice that for security reasons gdb will not be able
to inspect other programs until we "codesign" it manually using a
custom created certificate.

This can be done by following
[some instructions](http://ntraft.com/installing-gdb-on-os-x-mavericks/):
the steps are summarized below.

First, you need to create a certificate using the OS X Keychain
application. Open it, then select from the menu **Keychain Access >
Certificate Assistant > Create a Certificate**.

The certificate wizard will open. Create a certificate using the
following information:

* **Name:** gdb-cert *(or any name you want)*
* **Identity type:** self-signed root
* **Certificate type:** code signing

Also check the checkbox for overriding the default options.

Here are the options to override:

* extend the certificate validity to **10 years (3650 days)** or
  another long time at will;
* save the certificate in the **System** keychain **and not** in the
  login one.

After the certificate has been generated, select the System keychain
and double click on our certificate entry: expand the
**Authorization** triangle and mark the certificate as **always
trusted**.

Now, before codesigning gdb, open a terminal window. You must kill
[taskgated](https://developer.apple.com/library/mac/documentation/Darwin/Reference/Manpages/man8/taskgated.8.html)
as root:

```bash
sudo kill -15 $( ps -e -o pid,command | grep taskgated | grep -v grep | awk '{print $1}' )
```

You can finally codesign gdb using the certficate you created:

```bash
codesign --force --sign gdb-cert /usr/local/bin/gdb
```

Type your username and password whenever requested, and always allow
gdb to access the Keychain if prompted.

> gdb on OS X can run as root without needing a certificate, but it is
> not recommended to do that.


#### Test case: a program that crashes

Consider the following snippet:

```c++
#include <iostream>

#define FLOAT_ARY 12

void crash_function() {
  unsigned int answer_to_everything = 42;
  int another_number = -answer_to_everything;
  float many_floats[FLOAT_ARY];
  int counter_max = 10000;
  const char *test_string = "oh no, not again!";
  std::cout << test_string << std::endl;
  for (unsigned int i=0; i<counter_max; i++) {
    std::cout << "setting index " << i << " out of " << counter_max << ". string is: " << test_string << std::endl;
    many_floats[i] = 0.12345;
  }
  std::cout << another_number << std::endl;
}

void func2() {
  float pi = 3.14;
  crash_function();
}

void func1() {
  int a_variable = 456;
  a_variable += 1;
  func2();
}

int main(int argn, char *argv[]) {
  func1();
  crash_function();
  return 0;
}
```
<!-- restore syntax -->

Name it `crash.cxx` and compile it **with debug symbols**. On Linux:

```bash
g++ -g -o crash crash.cxx
```

On OS X:

```bash
g++ -g -o crash crash.cxx
```

This code contains an array of floats, allocated "on the stack"
(*i.e.* on the function's memory), which has space for 12 elements:

```c++
float many_floats[12];
```

However in the `for` loop we are writing way beyond its length in
order to artificially generate a crash. Let's run it:

```bash
$> ./crash
...
setting index 811 out of 10000. string is: oh no, not again!
setting index 812 out of 10000. string is: oh no, not again!
setting index 813 out of 10000. string is: oh no, not again!
setting index 814 out of 10000. string is: oh no, not again!
setting index 815 out of 10000. string is: oh no, not again!
setting index 816 out of 10000. string is: oh no, not again!
Segmentation fault: 11
```

The program crashes at a random point as expected.

> We did not obtain any stack trace automatically: this is a
> peculiarity of ROOT programs.

We want to run the program under a debugger in order to:

* obtain a stack trace
* see the value of the variables at the moment of the crash

Load the program under gdb:

```bash
gdb --args ./crash
```

On OS X you might use lldb:

```bash
lldb -- ./crash
```

From the gdb or lldb prompt, run the program by typing `run`: when the
program crashes, we are back at the debugger's prompt.

Here is the sample output from lldb (gdb's output is very similar):

```
* thread #1: tid = 0x13c1d0, 0x0000000100000ee8 crash`crash_function() + 280 at crash.cxx:14, queue = 'com.apple.main-thread', stop reason = EXC_BAD_ACCESS (code=2, address=0x7fff5fc00000)
    frame #0: 0x0000000100000ee8 crash`crash_function() + 280 at crash.cxx:14
   11  	  std::cout << test_string << std::endl;
   12  	  for (unsigned int i=0; i<counter_max; i++) {
   13  	    std::cout << "setting index " << i << " out of " << counter_max << ". string is: " << test_string << std::endl;
-> 14  	    many_floats[i] = 0.12345;
   15  	  }
   16  	  std::cout << another_number << std::endl;
   17  	}
```

The debugger is pointing us exactly to the line where the execution
has stopped: since we have compiled the program with debug symbols,
we have this precise reference and the debugger can even show us the
code snippet.

To manually show the code snippet, type `list` (both gdb and lldb). By
pressing Enter on the empty prompt you are repeating the last `list`
command that advances in the code until the end of file is reached.

To reset code listing to the beginning, type `list 1`.

Print a backtrace by typing `bt`:

```
* thread #1: tid = 0x13d53e, 0x0000000100000ee8 crash`crash_function() + 280 at crash.cxx:14, queue = 'com.apple.main-thread', stop reason = EXC_BAD_ACCESS (code=2, address=0x7fff5fc00000)
  * frame #0: 0x0000000100000ee8 crash`crash_function() + 280 at crash.cxx:14
```

Print the list of local variables available in the current program
context with `frame variable` (lldb):

```console
$> frame variable
(unsigned int) answer_to_everything = 42
(int) another_number = -42
(float [12]) many_floats = ([0] = 0.123450004, [1] = 0.123450004, [2] = 0.123450004, [3] = 0.123450004, [4] = 0.123450004, [5] = 0.123450004, [6] = 0.123450004, [7] = 0.123450004, [8] = 0.123450004, [9] = 0.123450004, [10] = 0.123450004, [11] = 0.123450004)
(int) counter_max = 10000
(const char *) test_string = 0x0000000100001f14 "oh no, not again!"
(unsigned int) i = 436
```

Print the value of a variable at this point in the program (both lldb
and gdb):

```console
$> print global_int
(int) $0 = 789
$> print test_string
(const char *) $1 = 0x0000000100001f14 "oh no, not again!"
```

We can manually set a "breakpoint" in the program to stop before
executing a certain line of code, then we can advance manually from
there.

Let's start by killing the current running process:

```
kill
```

Set a breakpoint when calling the function `func1()`. With lldb:

```
breakpoint set -b func1
```

With gdb:

```
break func1
```

Or, as an alternative, we can set the breakpoint to a certain line of
code. With lldb:

```console
$> breakpoint set -l 28
Breakpoint 1: where = crash`func1() + 15 at crash.cxx:28, address = 0x0000000100000f9f
```

With gdb:

```console
$> break set 28
Breakpoint 1 at 0x100000f9f: file crash.cxx, line 28.
```

Now run the program with `run`. It will stop where we told it to stop,
even if it did not crash: since the execution is stopped, we can do
many things:

* examine the variables
* advance line by line
* resume the normal execution
* delete the breakpoint

For instance, we set the breakpoint before incrementing the variable
`a_variable` of one unit: let's print its value:

```console
$> print a_variable
$0 = 456
```

Process next line with `next`, or simply `n`, then examine again:

```console
$> n
$> print a_variable
$1 = 457
```

The variable was correctly incremented by one unit like expected. To
resume normal execution just type `continue` (our demo program will
continue until the crash).

Current breakpoints can be listed. On lldb:

```console
$> breakpoint list
Current breakpoints:
1: file = '/tmp/crash.cxx', line = 28, locations = 1, resolved = 1, hit count = 1
  1.1: where = crash`func1() + 15 at crash.cxx:28, address = 0x0000000100000f9f, resolved, hit count = 1
```

On gdb:

```console
$> info breakpoints
Num     Type           Disp Enb Address            What
1       breakpoint     keep y   0x0000000100000f9f in func1() at crash.cxx:28
	breakpoint already hit 1 time
```

We can delete a breakpoint, or disable it if we don't want it to be
effective but we might want to restore it later. With lldb:

```console
$> breakpoint delete 1
$> breakpoint disable 2
$> breakpoint enable 2
```

With gdb:

```console
$> delete 1
$> disable 2
$> enable 2
```

We have now learned how to perform the basic operations with two
different debuggers: stopping the program's execution and checking on
the variable values.

Without a debugger those operations are commonly done by adding
printouts, input requests, etc.: we now know how to obtain the same
results without modifying our code.


#### Commands summary

| gdb              | lldb                      | description                 |
|------------------|---------------------------|-----------------------------|
| run              | run                       | start execution             |
| quit             | quit                      | exit debugger               |
| break            | breakpoint set [-l/-f...] | set a breakpoint            |
| delete           | breakpoint delete         | deletes a breakpoint        |
| info breakpoints | breakpoint list           | lists current breakpoints   |
| enable           | breakpoint enable         | enable a breakpoint         |
| disable          | breakpoint disable        | disable a breakpoint        |
| continue         | continue                  | resume a stopped execution  |
| kill             | kill                      | terminate current execution |
| list             | list                      | show source code            |
| print            | print                     | print value of a variable   |

> A complete list of gdb vs. lldb commands can be found on the
> official [lldb documentation](http://lldb.llvm.org/lldb-gdb.html).


Find memory leaks for ROOT object: TObjectTable
-----------------------------------------------

ROOT has a special class, called `TObjectTable`, which optionally
keeps track of all `new` and `delete` operations invoked on a ROOT
object, or, in other words, any object that inherits from `TObject`.

Hooks are present in the `TObject` constructor and destructor to
increment and decrement a counter for the specific object you are
creating or destroying. This operation is computationally expensive,
so you have to manually turn it on **before starting ROOT**.

You can create a `.rootrc` file in the current directory, or edit the
`$ROOTSYS/etc/system.rootrc` file, and enable the memory and object
tracking like this:

```
Root.MemStat: 1
Root.ObjectStat: 1
```

Inside ROOT, you can then tell the program at any point to print the
current number of objects by using the `gObjectTable` singleton:

```
$> gObjectTable->Print()
class                     cnt    on heap     size    total size    heap size

TKey                        4          4       72           288          288
TClass                     84         84       80          6720         6720
TDataMember               276        276       24          6624         6624
TObject                    11         11       12           132          132
TMethod                  1974       1974       64        126336       126336
TDataType                  34         34       56          1904         1904
TList                    2328       2328       36         83808        83808
TH1F                        1          1      448           448          448
TText                    2688       2688       56        150528       150528
TGaxis                      1          0      120           120            0
```

The **cnt** column is very useful as it gives you the number of
instances of a certain class: if you, for instance, forgot to delete
an object, you would see that number constantly increasing and you
would notice it quite easily.

> Remember to **turn MemStat and ObjectStat off** when done! They are
> very heavy for production operations.


Lightweight profiling with IgProf
---------------------------------

[IgProf](http://igprof.org), the Ignominious Profiler, is a
performance and memory profiling tool.

*"Profiling an application"* means finding the application's hotspots:

* in what functions the program spends most of the time
* what parts of the code do the most memory operations

One might want to perform profiling either because the application
appears to be slower than expected: in this case, profiling aims to
answer the question: where does my program **waste** more time?

For general optimization reasons, profiling is useful to understand
what parts of the code are worth optimizing: for instance, a very slow
initialization part that takes 10 seconds on a long job that lasts for
hours is not worth optimizing.

There are several profilers already used with success: for instance,
Valgrind's memcheck and callgrind tools.

IgProf and Valgrind have different scopes and very different ways of
working.

First of all, Valgrind is a **deterministic** tool, while IgProf is
**statistic**. Valgrind runs your code in a special internal virtual
machine that traps every single function call and memory operation:
the final report will be very precise, but the code execution might
take up to 40 times more.

On the other hand, IgProf just monitors **externally** the profiled
program: it periodically (with a high frequency) asks the system what
is the currently executing function of a certain program. The
advantages of this approach are:

* code runs at **native speed** and optimized for the **real
  architecture**: there is no Valgrind virtual machine slowing down
* no debugging symbols are needed, *i.e.* you do not need to compile
  with `-g`

> Note that `-g` should in fact be **off** when running with IgProf,
> as the tool aims to profile in conditions as close as possible to
> the production environment.

Of course, the big disadvantage is that the final report, being only
statistic, will be more imprecise than Valgrind's: but the idea is
that, for programs that take a long time to complete (like our physics
analyses), IgProf might miss the least called functions, but its
precision on the most called functions is very close to Valgrind's.

In practice, IgProf is considered much more efficient than Valgrind
when attempting to optimize code with a long running time for a
certain architecture.

> **Beware!** It is not implied that IgProf is a replacement of
> Valgrind: it is instead a lightweight alternative to it for a
> limited and specific number of cases.


### Installing IgProf on Ubuntu

IgProf is not available on OS X. To install it on Ubuntu 14.04, here
is a slightly modified version of the
[official installation recipe](http://igprof.org/install.html):

```bash
mkdir -p $ALICE_PREFIX/igprof/src
cd $ALICE_PREFIX/igprof/src

IGPROF_VERSION=5.9.10
LIBATOMIC_VERSION=7.2alpha4
LIBUNWIND_VERSION=1.0.1
```

Download and unpack:

```bash
wget http://www.hpl.hp.com/research/linux/atomic_ops/download/libatomic_ops-$LIBATOMIC_VERSION.tar.gz
wget http://download.savannah.gnu.org/releases/libunwind/libunwind-$LIBUNWIND_VERSION.tar.gz
wget -Oigprof-$IGPROF_VERSION.tar.gz https://github.com/ktf/igprof/archive/v$IGPROF_VERSION.tar.gz

for f in *.tar.gz ; do tar xzf $f ; done
```

Build the three components. libatomic:

```bash
cd libatomic_ops-$LIBATOMIC_VERSION
./configure --prefix=$ALICE_PREFIX/igprof
make -j$MJ install
cd ../
```

libunwind:

```bash
cd libunwind-$LIBUNWIND_VERSION
./configure \
  CPPFLAGS="-I$ALICE_PREFIX/igprof/include -U_FORTIFY_SOURCE" \
  CFLAGS="-g -O3" \
  --prefix=$ALICE_PREFIX/igprof --disable-block-signals
make -j$MJ install
cd ../
```

To install IgProf, you need `libpcre3-dev` and `cmake`:

```bash
aptitude install libpcre3-dev cmake
```

Build it (a small patching is needed to the `CMakeLists.txt`file):

```bash
cd igprof-$IGPROF_VERSION
sed -e 's/-Werror//g' -i CMakeLists.txt
cmake \
  -DCMAKE_INSTALL_PREFIX=$ALICE_PREFIX/igprof \
  -DCMAKE_CXX_FLAGS_RELWITHDEBINFO="-g -O3" \
  -DUNWIND_INCLUDE_DIR=$ALICE_PREFIX/igprof/include \
  -DUNWIND_LIBRARY=$ALICE_PREFIX/igprof/lib
make -j$MJ
make install
cd ../
```


### Running IgProf

Assuming that IgProf and libunwind are installed under
`$IGPROF_PREFIX`, you need to set the following environment:

```bash
export PATH="$ALICE_PREFIX/igprof/bin:$PATH"
export LD_LIBRARY_PATH="$ALICE_PREFIX/igprof/lib:$LD_LIBRARY_PATH"
```

If everything is OK, `igprof` should be in the path:

```bash
$> which igprof
/home/ubuntu/alice/igprof/bin/igprof
```

Suppose you normally launch your AliRoot macro like this:

```bash
aliroot -b -q myTestMacro.C++
```

It is very easy to run it under the IgProf performance profiler:

```bash
igprof -pp -z -o myTestMacro.pp.gz aliroot -b -q myTestMacro.C++
```

In this case:

* we are using the **performance profiler** (`-pp`)
* output data will be compressed (`-z`)
* output data will be saved to myTestMacro.pp.gz (`-o`)

When the process has finished, launch the following command to produce
a parsed text output:

```bash
igprof-analyse -v -g myTestMacro.pp.gz > myTestMacro.pp.txt
```

### Interpreting IgProf data

The resulting text file contains information on the absolute and
relative amount of time spent inside each function. It is composed of
two main sections:

* a **cumulative timing** part, indicated by `Flat profile (cumulative
  >= ...%)`, where each percentage takes into account the time spent
  in that function and in all functions invoked by it;
* a **self timing** part, indicated by `Flat profile (self >= ...%)`,
  where the time spent in the functions called by the current
  function are *not* taken into account.

There is another third section highlighting the stack calls for each
entry of the first two tables.

The following example is taken from a profiling performed on the ROOT
`hadd` executable for merging histograms in different files to a
single output. Test conditions:

* 984 ROOT files
* 10000 TH1F histograms
* 100 bins per histogram

The *self* profiling data is presented below:

```
Flat profile (self >= 0.01%)

% total       Self  Function
  23.60      23.46  __strcmp_ssse3 [23]
  19.67      19.55  TDirectoryFile::GetKey(char const*, short) const [21]
  10.77      10.70  TListIter::Next() [24]
   3.92       3.90  TNamed::GetName() const [35]
   3.02       3.00  inflate [26]
   2.79       2.78  inflate_table [45]
   2.16       2.14  inflate_fast [54]
   2.14       2.13  __read_nocancel [55]
   2.04       2.02  TList::FindObject(char const*) const [37]
   1.40       1.39  __strcmp_ssse3 [69]
   0.77       0.77  _init [84]
...
```

What we notice is that about a quarter of the total running time is
spent inside the `__strcmp_ssse3` function, which performs string
comparison. Another consistent percentage is spent in the `GetKey()`
method of ROOT, used to obtain the key in a file corresponding to a
certain object name.

The result is astonishing, as we do not expect string comparison to
be the heaviest part of our merging code.

Next to `__strcmp_ssse3` there is a `[23]` indication, that points to
the relevant stack trace portions:

```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
Rank    % total       Self       Self / Children   Function
           58.7  .........      58.34 / 62.09        TDirectoryFile::WriteTObject(TObject const*, char const*, char const*, int) [20]
[21]       58.7      58.34      19.55 / 38.79      TDirectoryFile::GetKey(char const*, short) const
           22.7  .........      22.57 / 23.46        __strcmp_ssse3 [23]
           10.4  .........      10.37 / 10.70        TListIter::Next() [24]
            3.8  .........       3.76 / 3.90         TNamed::GetName() const [35]
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
            0.9  .........       0.90 / 3.29         TList::FindObject(char const*) const [37]
           22.7  .........      22.57 / 58.34        TDirectoryFile::GetKey(char const*, short) const [21]
[23]       23.6      23.46      23.46 / 0.00       __strcmp_ssse3
```

This is useful to understand *what* called the string comparison: from
the stack trace, we notice that `GetKey()` calls it, and it is in turn
called by the public function `TList::FindObject()`. `GetKey()` is
also invoked by `WriteTObject()`.

Now, when merging data from different files, objects with the same
name are merged, and they have to be looked by using the
`FindObject()` function: by blindly profiling the code, we have
understood what is the part of the code where it is worth starting
the optimization.

The string comparison function is provided by the system, and it is
already heavily optimized: the code has been then optimized by trying
to *avoid* calling the string comparison as much as possible during
the lookup of objects.

In this case, the optimization consisted in using a hash table instead
of using a list for storing objects. When performing a string lookup,
hashes of the current string and precomputed hashes of each element
are compared: since they are numbers, the comparison is much faster.

If hashes match, it does not mean that strings match, as hashes have
less degrees of freedom than strings: only in the case they match, an
actual string comparison is performed.

After the optimization (committed in ROOT), here is the relevant part
of the self profile:

```
Flat profile (self >= 0.01%)

% total       Self  Function
   8.86       3.20  inflate [21]
   8.68       3.14  inflate_table [31]
   5.74       2.07  inflate_fast [42]
   4.98       1.80  TList::FindObject(char const*) const [32]
   3.01       1.09  __read_nocancel [64]
   2.41       0.87  TH1::Merge(TCollection*) [30]
...
```

The string comparison has completely disappeared, and now other
functions take most of the time. In the above example, the `inflate`
functions are used because ROOT files are compressed, and the calls to
`FindObject()` have already been optimized.

In a couple of hours we were able to:

* profile an unknown code
* understand where it spends the majority of its time
* optimize the relevant part


### Performance profiling on OS X

As we have said, IgProf is not available on OS X. However, Xcode
includes an excellent graphical tool called
[Instruments](https://developer.apple.com/library/mac/documentation/DeveloperTools/Conceptual/InstrumentsUserGuide/Introduction/Introduction.html):
if you have installed Xcode, open it, then go to the menu
**Xcode > Open Developer Tool > Instruments**.

A main menu is presented: the **Time Profiler** tool can be used to
sample a running process and to obtain an interactive and browsable
profile.

![Xcode Instruments](xcode-instruments-main.png)

Profiles obtained with IgProf and Instruments are very similar, and
the considerations on interpreting and optimizing are valid for both
tools.


Valgrind
--------

[Valgrind](http://valgrind.org/) is a complex and robust tool to
perform code analysis and profiling.

Valgrind is composed of many *tools*, each one of them performing a
different task. The two tools we are interested in are:

* **memcheck**: the memory checker
* **callgrind**: a performance profiler

Installing Valgrind on Ubuntu is easy:

```bash
aptitude install valgrind
```

On OS X it is easy as well. With Homebrew:

```bash
brew install valgrind
```

### Memory check

Memory checks with Valgrind are useful to find the following memory
problems:

* invalid memory reads
* invalid memory writes
* potential memory leaks

Valgrind will indicate the potential problems in the logfile it
produces. Since it can be hard to understand the logfile, there are
also graphical tools showing:

* memory trends (with respect to running time): useful to see when and
  how the memory grows
* allocation peaks: useful to see which are the parts of your code
  making the most memory allocations

We recommend using the massif-visualizer tool. On Ubuntu 14.04, it can
be installed by going to
[this page](https://launchpad.net/ubuntu/trusty/+package/massif-visualizer)
and selecting under "Published versions" the version corresponding to
your architecture (*e.g.* the one ending with `amd64` for a 64 bit
machine): on the page that opens, download the .deb file.

For convenience, here is a direct link to the 64 bit version:

» [massif-visualizer 0.3 for Ubuntu 14.04](http://launchpadlibrarian.net/119729130/massif-visualizer_0.3-0ubuntu2_amd64.deb)

Install the .deb package by running:

```bash
sudo gdebi massif-visualizer_0.3-0ubuntu2_amd64.deb
```

Or you can just open the package through the graphical interface and
follow the instructions to install it.

Run your program under Valgrind's memory check. The following command
is suitable for AliRoot (see `man valgrind` for more details):

```bash
valgrind \
  --tool=memcheck \
  --error-limit=no \
  --max-stackframe=3060888 \
  --suppressions=$ROOTSYS/etc/valgrind-root.supp \
  --leak-check=no \
  --num-callers=40 \
  --log-file=/tmp/valgrind_memory.log \
  aliroot -b -q launchMyAnalysis.C+
```

A couple of notes.

* The `--suppressions` switch is used to tell Valgrind which alleged
  memory problems to ignore. The file we pass to it is the ROOT
  suppressions file, and greatly simplifies the produced output by
  reducing false positives.
* The `--leak-check=no` makes the execution much faster, but it does
  not check for memory leaks. Use `--leak-check=full` for a deeper
  inspection, but expect a longer running time.

> Valgrind traps all memory operations through an internal "virtual
> machine": this is why it can be up to 40 times slow. Run your
> program under Valgrind on a very small dataset!

To produce data readable with the massif-visualizer, use
`--tool=massif`, which invokes the
[massif heap analyzer](http://valgrind.org/docs/manual/ms-manual.html)
instead of memcheck.

An example of the interactive output produced by massif-visualizer is
presented:

![massif-visualizer](massif-visualizer.png)


### Performance profiler

Valgrind has a performance profiler called
[callgrind](http://valgrind.org/docs/manual/cl-manual.html). Its
purpose, like IgProf, is to analyze how much time is spent in each
function. As we have already discussed, being a deterministic tool
every single function of your program is trapped and captured, which
makes the tool very precise, but also very slow.

Callgrind's output can be analyzed by means of the KCachegrind program
that can be installed on Ubuntu 14.04 with:

```bash
sudo aptitude install kcachegrind
```

The typical way of invoking Valgrind's callgrind for AliRoot programs
is:

```bash
valgrind
  --tool=callgrind \
  --log-file=/tmp/valgrind_callgrind.log \
  aliroot -b -q launchMyAnalysis.C+
```

The produced output can be browsed interactively by means of
KCachegrind. An output similar to the following is presented:

![KCachegrind](kcachegrind.jpg)

where coloed blocks indentify graphically which are the functions
where your program spends most of its time.

<!--
* brew install homebrew/dupes/gdb
* Problems loading libraries [skipped for now]
 * Find libraries needed by other libraries or executables (Linux and
   OS X: ldd, otool)
 * List symbols in a library or executable (Linux and OS X: nm)
  * Meaning of some flags
 * Loading of library fails because a symbol is missing: how to find
   which library to load first
-->