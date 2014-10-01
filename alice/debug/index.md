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
1: file = '/Users/volpe/Temp/macr/crash.cxx', line = 28, locations = 1, resolved = 1, hit count = 1
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




<!--

brew install homebrew/dupes/gdb

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

* Problems loading libraries [skipped for now]
 * Find libraries needed by other libraries or executables (Linux and
   OS X: ldd, otool)
 * List symbols in a library or executable (Linux and OS X: nm)
  * Meaning of some flags
 * Loading of library fails because a symbol is missing: how to find
   which library to load first
-->
