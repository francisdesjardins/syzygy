# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the app's memory.** The code states what holds now; why it came to hold lives here.

## 2026-09-16, the front door moves in

### Added

The homepage of francisdesjardins.ca, carried over from its own repository at `b07d934`: 17 files
and 1090 lines, which is the route's real closure rather than a guess at it. The page, the two
fixed-corner toggles, the MUI theme, the i18n setup and the skin.

It came out of a project of some 250 files. Tracing the import graph from `main.tsx` reached 219 of
them — because `App.tsx` named all six routes, five of which were experiments. Trimming it to the
one route that is online gave the 17.

### What came with it, and what did not

**`tokens.system.css` was a third copy of [penumbra](../../packages/penumbra).** Not a near-copy:
across 93 lines, every declaration matched. And its header said, in as many words, that the day
these siblings shared a monorepo the copies would collapse into one package. That is now the second
time that same file has made that prediction and been right. It is a dependency.

**`LocalizationProvider` and `@mui/x-date-pickers` are gone**, with `date-fns` behind them. They
were feeding date fields that exist only in the scratchpad this page was living in.

**The only page is imported, not lazily loaded.** Splitting the sole route off the entry chunk buys
a network round trip before anything paints.

**`react` moved 19.2.8 → 19.3.0**, matching the playgrounds, so the lockfile holds one React rather
than one per app.

### How any of that is known to be safe

The old build was fingerprinted before a file moved, and the fingerprint is deliberately wider than
a screenshot: the full DOM tree under `#root` with 35 computed properties on every element, every
meta tag, every hand-written head link, the JSON-LD parsed and re-serialised, in four combinations —
English and French, light and dark, desktop and phone — plus what both toggles do when clicked.

448 lines. The new build reproduces them byte for byte, and still did after the toolchain
conversion, and still did when measured from inside the deploy zip rather than from the tree that
produced it.

Emotion's class names are normalised out and the styles measured instead, because a class name is
a hash of its own contents: comparing them would fail on a rename and pass on a changed colour,
which is backwards.

### Fixed

`useDocumentHead` asserted `document.querySelector(…) as HTMLMetaElement`, twice. `querySelector`
answers `null` when the element is absent — and that is exactly the branch underneath, the one that
creates the tag. The assertion erased the `null` from the type, so the guard read as unreachable to
anything type-aware while it went on running. The type-aware lint found both the day it was pointed
at this code.

### Changed

The six `@mui/material` barrel imports became per-module ones. One barrel import puts MUI's whole
re-export graph into every compile; the playgrounds already carry the rule, and this app now runs
their `.oxlintrc.json` unchanged.
