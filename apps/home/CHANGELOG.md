# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the app's memory.** The code states what holds now; why it came to hold lives here.

## 2026-09-17, a second page, and two palettes that are not this site's

### Added

`/design-system` — penumbra taken apart, with a switch over three layerings of one specimen: the
base alone, an eleven-declaration tint over it, and a skin that replaces the base outright.

The specimen is plain markup styled entirely through `var(--app-*)` — no MUI inside it, no literal,
no branch on the colour scheme — which is what makes the switch a demonstration rather than three
hand-drawn pictures. The same 24 base names and the same 8 brand names are all exercised by it, so a
state that fails to declare one shows the gap instead of hiding it.

**The sheets are read as text and their `:root` is rewritten to the preview's own selector.** A
token sheet says `:root` because that is where a design system lives; a preview is the one place it
is not true. Rewriting rather than keeping scoped copies is what keeps the page honest — the bytes
on screen are `penumbra/tokens.skin.base.css` and the two example skins as they sit on disk.

`src/styles/skins/tint.css` and `src/styles/skins/replaced.css` are that demonstration material and
live here rather than in the package, which ships nothing a project would inherit as a default.

**A custom property inherits, which nearly made the page lie.** This site declares its three faces
on `:root`, so the state that declares no typeface was showing them — "the base ships none" is a
claim the screen would have contradicted. The preview resets the three names to `initial` and a
skin re-declares them; colour needed no such reset, this site keeping its palette in MUI.

### Added — the palettes are measured

`yarn check` runs `penumbra-contrast` over both example skins, the second with `--no-base` since it
declares everything itself. Sixteen pairs each, both schemes.

The page's own chrome was measured in a browser with alpha composited, six configurations —
three states times two schemes — and one thing turned up that reading the source would not have:
MUI spends `rgba(0, 0, 0, 0.54)` on an unselected toggle button, which composites to **4.42:1** on
this page's ground. Under AA, on the page that argues colour should be measured.

### Changed

`/` is no longer the only route, so `App` splits: the landing page stays in the entry chunk, where
a second round trip before first paint would be paid by every visitor, and `/design-system` is
lazy. penumbra joins the two playgrounds in "What's running" — a `RouterLink`, not an anchor,
because unlike them it is a page of this application rather than its own build.

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
