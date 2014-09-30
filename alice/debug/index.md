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
`-g` switch: by default, this also turns off all optimizations, *i.e.*
it implicitly enables `-O0`.

It is still however possible to enable optimizations with `-g`, but it
is not recommended at all. The safest way to compile code ready for
debugging is:

```bash
gcc -O0 -g ...
```

The same flags are used for `clang`.

When seeing a backtrace


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
AliRoot is built in debug mode.

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
code, although it provides you with more information. A visible effect
is a clearer backtrace if the code crashes. Consider the following
backtrace snippet:

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
...
```

Line numbers are present (like `AliAnalysisTask.h:113`) as extra
information provided by debug symbols. Debug symbols also retain
variable names, as we will see when running our code through `gdb`.

> Only use debug builds for temporary tests: turn off debugging when
> sending your code to production!

<!--
Refined version
---------------

* Prepare your code for debug
 * What are the "debug symbols"?
 * How to compile ROOT with debug symbols
 * How to compile AliRoot with debug symbols
 * How to compile your analysis with debug symbols
 * How to check if the code has debug symbols

* Where does my code crash?
 * "printf/cout" technique: how to do it smartly
  * The AliRoot way
  * The generic way
 * Understand a backtrace and generate one manually
  * The ROOT way
  * gdb
   * set a breakpoint
   * print value of variable or expression
   * print the backtrace

* Valgrind
 * Obtain Valgrind: Linux and OS X
 * Memory tool and callgrind
 * Why Valgrind is so slow? (Hint: it is a "deterministic" tool.)
 * Run an analysis under Valgrind
  * Analyze Valgrind output
  * Take appropriate actions
 * When to use Valgrind (Hint: it is the "last resort".)

* IgProf: the Ignominious Profiler
 * Obtain IgProf: Linux (not available under OS X)
 * Memory profiler and performance profiler
 * Why IgProf is so fast? (Hint: it is a "statistic" tool.)
 * Run an analysis under IgProf
  * Analyze IgProf output
  * Amend your code appropriately

* ROOT's TObjectTable
 * What is it (Hint: counts every TObject instance)
 * Turn it on and off, check if it is on
 * Retrieve results (do it periodically to quickly check for leaks)

* Problems loading libraries
 * Find libraries needed by other libraries or executables (Linux and
   OS X: ldd, otool)
 * List symbols in a library or executable (Linux and OS X: nm)
  * Meaning of some flags
 * Loading of library fails because a symbol is missing: how to find
   which library to load first
-->

<!--
What to do
----------

* Debugging techniques:
 * gdb/lldb
 * printf with 100, 200, 300 (like BASIC line numbers)
  * an efficient way of doing printf with the defines
   * AliDebug does exactly that: use it
   * Use AliDebugF for formatting messages (instead of
     AliDebug(Form()))
* How to compile AliRoot and ROOT with the "debug" options
 * ROOT: ./configure --build debug
  * Note: you must recompile everything, and not just run ./configure
  * Since on your computer you will not run any production code, it
    is recommended you do that
  * Note: the important thing is that your analysis task is compiled
    with the debug options
 * When to do that
 * When not to do that
 * Example: assertions and what changes
* What if my code is slow?
 * What is IgProf?
 * How to compile IgProf on Ubuntu
 * IgProf: find where the program spends most of the time
  * Code "too" efficient!
 * Also useful for optimizations: optimize only "relevant" parts
* What if my code eats lots of memory?
 * IgProf
 * Valgrind
* Read and understand a backtrace
* What if a symbol is missing?
 * Note: with libraries, order matters
 * Mangling and demangling symbols: why, and c++filt
 * Find what libraries are needed by an executable or another library
 * Find where a missing symbol is
* Before insanely plunging into a debug
 * Understand a backtrace
 * Check indentation (gotofail problem)
* Have I compiled everything properly?
 * Check if I have compiled with or without debug symbols
 * Use the precompiled AliRoot from cvmfs
  * The same you find on the Grid
  * Note: you don't have debug symbols there(?check?)
  * General way of checking if a library or executable has been
    compiled with the debug symbols
* Two notes:
 * Code is either optimized, or compiled with debug symbols. They are
   mutually exclusive
 * A limited backtrace may be obtained even if you do not have debug
   symbols
 * IgProf does not need debug symbols and it is used for testing on
   the real architecture
-->
