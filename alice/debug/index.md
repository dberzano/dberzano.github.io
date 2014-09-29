---
title: "Basic code debugging"
layout: tweet

createtoc: true
parnumbers: true
---


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

