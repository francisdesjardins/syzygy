# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the package's memory.** The code states what holds now; why it came to hold lives
here.

## 2026-09-17, penumbra gets a playground

### Added

`playground/` — a third workspace beside the two libraries', served at `/playground/design`.

**Its main page was already written, twice.** Both sibling playgrounds carried a route titled
"Penumbra" rendering corona's token tables: 16 of the 22 tokens each one documented in prose belong
to this package, and six of its seven sections showed the system half — which is the same file
everywhere by construction. What is left there is each project's own colours and its own recipes,
which is a section rather than a page.

**The skin is teal, and that is a decision.** Antumbra is amber through and through; umbra is amber
lit by indigo. A design system wearing one of its consumers' colours makes that consumer's argument
for it, so this is the third and the coolest of the three. `penumbra-contrast` holds it to 32 pairs
across both schemes, and caught the first attempt: teal-500 as a mark measured 2.49:1 against the
3:1 it owes, so the fill is teal-600.

**The `Skins` page came from the site's own design-system page**, rewritten without MUI. Its token
list used to print seven names and nothing else — no two rows differed, which made the list an
ornament. Each row paints its own swatch through `var(<token>)` now, so it resolves in the preview's
scope; reading the values in JavaScript would have read the _page's_ instead, which is the bug one
layer down.

The moon is the third face on corona's eclipse: eyes closed, a small even smile, and the terminator
faint across the disc. The penumbra is the one region of a shadow with nothing to resolve.

## 2026-09-17, a tie in the stacking scale is now a failure

### Fixed

`--app-z-mascot` was `30`, the same number as `--app-z-sidebar`, and is now `10`.

Equal values do not order anything. Whichever element renders last wins, and both playground shells
render the mascot after the shell, so it sat above the drawer's backdrop. That is not a paint
problem: the backdrop is `pointer-events: auto` so a tap outside the drawer closes it, and the
mascot is fixed, clickable, and drifts across the viewport. A tap landing on it at phone width did
nothing at all — the drawer stayed open.

Below the backdrop rather than beside the sidebar, because that answers both halves: an open drawer
now dims the mascot along with the page and takes the tap meant for it.

### Added

**No two `--app-z-*` tokens may share a value**, checked by `check-tokens.mjs`, with a guard beside
it that fails if the pattern stops matching the scale. The bug was reachable because the scale had
a tie in it, not because one token had the wrong number, so that is what the gate refuses.

## 2026-09-17, the contrast gate comes to the vocabulary

### Added

`penumbra-contrast` — a bin, moved here from umbra, where it was about to be copied a second time.

The pair table is the reason it belongs to this package and not to `gnomon` with the other gates:
`--app-primary-ink on --app-primary` owes 4.5:1 because of what those two names mean, and the names
are penumbra's. A consumer holding its own copy of that table would be maintaining a definition it
does not own — which is the same argument that moved `tokens.system.css` here, arriving from the
tooling side.

Sixteen pairs, split by what they need. Eleven have both tokens in the base and are measured on
every run, including a run with no skin at all. Five need a brand token and are measured only once
a skin exists — **and the split is stated in the output**, because silently dropping five would
make an unskinned run read like a full one.

`--no-base` measures a project that replaced the base outright rather than layering over it.

### Changed

umbra's `check:contrast` is the bin now and its script is gone. antumbra gained the same line: its
palette had no gate in `yarn check` at all, only a browser audit somebody had to remember to run.

## 2026-09-17, the half of a palette that is not a brand

### Added

`tokens.skin.base.css` — 24 names across 47 declarations: the surfaces, the three text ranks, the
divider, the control edge, the hover and selected states, the four semantics with their washes, the
scrim, the scrollbar and `--app-lift`, in both schemes.

This reverses the refusal recorded below, and the measurement is what reversed it. The two skins in
this repo were said to be "deliberately nothing alike"; they agreed **byte for byte on every one of
the 47 declarations that moved**, and had agreed since the day the second was written. The claim
was about a palette. What the files actually held was a palette _and_ a ground, and only the palette
was ever the project's.

So the refusal stands where it was aimed. A brand is still not shipped here. A neutral, a semantic
and a scrim are not a brand — they are what a project inherits without losing anything it would have
chosen — and the argument for keeping them in two hand-maintained copies was the same argument the
system half already lost.

The extraction is inert by construction: every name moved was identical in both sources, and none
of them is declared by the system half. Proven rather than asserted — 332 resolved custom-property
values read out of both built playgrounds in both schemes, before and after, with zero differences.

### Added — the gate runs in both directions now

`yarn check` already refused a colour or a typeface in the system half. It now refuses, in the
base, a typeface, a name from the `--app-primary`/`accent`/`flame`/`ring`/`glow` family, and any
token the system half already declares.

The brand rule is a list of names rather than a test of the value, and that is not laziness:
`#b91c1c` is a brand red or a semantic error depending only on which name it is bound to, so the
name is the only thing there is to check.

### Changed

`umbra`'s `check:contrast` reads the base underneath the skin. Fourteen of its sixteen pairs have a
base colour on at least one side, so measuring the skin alone would have measured a palette the
browser never shows — and, once the skin shrank to twelve declarations, would have failed on a
missing token instead.

## 2026-09-15, a package, because prose did not hold

### Added

`tokens.system.css` — scale, rhythm, motion and stacking, with no colour and no typeface in it.

It existed twice before this, one copy per playground, each with a header explaining that the file
was meant to travel unchanged and predicting that the day the two projects shared a monorepo the
copies would collapse into one package. That prediction was correct and the rule it stated held on
the substance: across 93 lines, **not one declaration differed** between the two copies. What had
drifted was the header itself — four lines of comment, in the copy that got the better wording.

Which is the argument for the package rather than against it. Two copies agreed for months because
someone kept them agreeing, by hand, reading a comment. The first time nobody did, they would not
have. There was no mechanism, only diligence.

### Added — the split has a gate now

`yarn check` refuses a colour or a typeface among the declarations, and refuses a sheet that has
become suspiciously small — an empty file satisfies every other rule trivially, which would make the
check a comfort instead of a gate.

The colour half of that rule already existed, as a Playwright test inside one of the two
playgrounds. A rule about a shared file, enforced from inside one consumer, guards that consumer and
leaves every other one unguarded — so it belongs to the package that owns the file.

### Not added, deliberately

A reference skin. Shipping one makes it the default, and a default palette is precisely what the
next project inherits without ever choosing it. The two skins in this repository are worth reading
as examples instead; they are deliberately nothing alike.
