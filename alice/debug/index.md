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
