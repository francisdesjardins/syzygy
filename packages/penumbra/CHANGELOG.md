# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the package's memory.** The code states what holds now; why it came to hold lives
here.

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
