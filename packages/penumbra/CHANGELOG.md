# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the package's memory.** The code states what holds now; why it came to hold lives
here.

## 2026-09-17, the half of a palette that is not a brand

### Added

`tokens.skin.base.css` — 24 names across 47 declarations: the surfaces, the three text ranks, the
divider, the control edge, the hover and selected states, the four semantics with their washes, the
scrim, the scrollbar and `--app-lift`, in both schemes.

This reverses the refusal recorded below, and the measurement is what reversed it. The two skins in
this repo were said to be "deliberately nothing alike"; they agreed **byte for byte on every one of
the 47 declarations that moved**, and had agreed since the day the second was written. The claim
was about a palette. What the files actually held was a palette *and* a ground, and only the palette
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
