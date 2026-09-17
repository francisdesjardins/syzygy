# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the package's memory.** The code states what holds now; why it came to hold lives
here.

## 2026-09-17, the two hardest modules had the thinnest tests

### Changed

`single-flight` went from 3 tests to 19, `mutex` from 3 to 12, and the package from 59 to 84.

The distribution was backwards. `fuzzy-match` had 22 tests over 142 lines; the two **concurrency
primitives** — where a bug is a race nobody can reproduce on demand — had three each. They are also
the two modules this package exists to hand to somebody else, which is a claim that they work.

**Every new test was proven able to fail.** Twenty-three mutants were injected into the two sources
and each test is the isolated killer of at least one: `.finally` swapped for `.then` (a rejected
flight then caches its own failure forever), the generation guard narrowed to ignore only the
previous call, `controller = null` dropped from the rejection branch alone, `reject` swapped for
`resolve`, the lock replaced by a single microtask hop.

Three of the first-draft tests survived their own mutants and were rewritten: instance isolation
was only exercised in the default mode, where one variable is per-instance — `last` keeps five, and
hoisting them all to module scope passed. The retroactive-abort test walked only the resolution
path. And a stale task outliving a _settlement_ needs the later flight still airborne when the
ghost lands; a settled one has no resolver left to hijack, which is exactly what hid the bug.

### Fixed

A rejected **promise** handed to `createMutex` while the chain was busy was reported as an unhandled
rejection by the runtime before the chain ever reached it — the only handler was the gate's, and the
gate may not open for several turns while Node decides at the end of the current one. The rejection
is claimed on arrival now. Eight lines, no change to ordering, to the returned value, or to the
documented contract; it only brings the promise branch in line with what the function branch already
did.

### Documented, not fixed

**The mutex is not reentrant**: calling it from inside a task deadlocks both halves, silently and
forever — the outer task awaits the inner, which awaits the gate, which awaits the outer. Making it
reentrant would change the contract this package documents, so a test pins the behaviour instead.

**The signal in `single-flight`'s default mode is inert by design.** Nobody may cancel a shared
flight, because every caller co-owns it; the fresh controller exists so the task's signature is the
same in both modes. That was an open question until a test settled it.

### Added

A real `check`. It was `tsc --noEmit` alone, so 500 lines here were type-checked and neither linted
nor formatted — and the linter had findings the moment it was pointed at them.

## 2026-09-16, four primitives that were never shared at all

### Added

`mutex`, `single-flight`, `shallow-equal` and `slice-declaration` — 235 lines, and the 24 tests
that came with them.

**These were not duplicated.** They existed once, in the dialog manager's playground, where nothing
but that playground could reach them. That is the other half of what this package is for: the first
entry collapsed copies, this one moves a primitive out of the one app that happened to author it.
A `createMutex` locked inside a demo is a `createMutex` the next project writes again.

The entry rule is unchanged and did the choosing again. Of the seventeen modules in that
playground's `shared/lib` that the other one lacks, exactly these four import **nothing at all**.

### Not yet — and the reason is one function

`runAsync` and `safeAwait` belong here by every other measure: no framework, no UI, pure machinery
over a promise. Each imports exactly one thing, `normalizeError`, and that function exists **twice**
in this repository — 15 lines in the dialog manager, 45 in the bootstrapper, independently written.
Moving the callers first would make this package depend on one library's version of a primitive the
other library also owns.

So the order is forced: normalise `normalizeError`, then these follow. `watch` waits on the same
question one level up — its only import is a store contract type, and there are two of those too.

## 2026-09-16, the three that had not drifted

### Added

`color-contrast`, `fuzzy-match` and `readable-syntax`, with the 35 tests that came with one of the
two copies.

This package was planned as something much larger. The phase that created it was written to absorb
"the playground shell" — the layout, the navigation, the chrome both demos share — and sized at 28
files. Measuring first is what shrank it to three.

The shell is not shared. `RootLayout`, the sidebar, the top bar and the navigation all diverge,
**and should**: the two playgrounds demonstrate different libraries and therefore hold different
pages. The API reference route looked shareable at 943 lines until its dependencies were traced —
it needs five components, and four of them differ by design rather than by neglect. `CodeBlock`
diverges on 117 of 129 lines; the icon set on 183. Those are two products, not one product copied
badly.

What was genuinely shared was smaller and of one kind.

### The finding that drew the boundary

Seven modules sat at `shared/lib` on both sides. Split by whether they import anything at run time,
they split perfectly:

|                    | modules | divergence  |
| ------------------ | ------- | ----------- |
| no run-time import | 3       | **0 lines** |
| imports React      | 4       | 11–38 lines |

Byte-identical against drifted, with nothing in between. Two copies of a pure function stay equal
because there is only one right answer and both authors found it; two copies of a hook drift because
each one bends toward the app around it.

That is why the package takes framework-freedom as its rule rather than its description. It is the
property that made these three shareable, and the absence of it is what made the other four not.

### Not taken, deliberately

`useDocumentTitle` diverges by exactly one line — a product-name constant — and is the most tempting
file in either playground. It is a hook. Taking it would spend the rule above on 52 lines and put
React in a package whose whole claim is that it does not need one.

`fonts.css` is three `@font-face` blocks. It belongs to a design system, and this one —
[penumbra](../penumbra) — refuses typefaces by an invariant of its own.

`react-syntax-highlighter-subpaths.d.ts` is ambient, so it has to sit inside each consumer's
`include` to do anything. Sharing it would mean each consumer reaching across a package boundary to
find it, which costs more than the 53 duplicated lines it saves.
