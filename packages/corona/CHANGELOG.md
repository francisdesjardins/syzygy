# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the package's memory.** The code states what holds now; why it came to hold lives
here.

## 2026-09-16, the reference stops existing twice

### Added

The API reference viewer and the contract it reads: 25 files out of each playground's `pages/api`,
and the four model types that had been declared once per generator.

The extraction was refused a week earlier, in the phase that produced [limb](../limb). The reason
given was that the route needs five components from `shared/ui` and four of them differ by design —
`CodeBlock` on 117 of its 129 lines. That was true and it was not a reason.

**The mistake was one of method.** The route's imports were measured as a flat set across all its
files, so the worst dependency vetoed the directory. Nobody asked _which_ files needed the divergent
components. The answer is five of twenty-five; the other twenty need nothing that differs.

### What the measurement found once it was asked properly

Before any of this, 15 of 25 files were byte-identical between the two playgrounds and 8 more
differed by a single import line — the virtual module, named after its library on one side. Naming
it after the capability instead took the count to 19 and 1269 lines.

Three of the six remaining divergences were a superset, not a disagreement: one library's model can
emit a `class` kind and the other's cannot, so its badge table and stylesheet lacked the tone. One
was a redundant prop, both buttons already defaulting to it. One was a focus-ring fix present on one
side only. That left `ApiIndexPage`, whose entire difference is three tables of per-library data —
which entry points exist, what each is for, what to call it.

So the seam was never where it was declared to be. It runs between **the generated model and the
page that shows it**, not between two directories.

### The two failures worth keeping

**A second copy of `@tanstack/react-router`.** Each workspace group is its own hoisting boundary, so
this package resolves its own. A router is a _value_ registered by the host's provider; a second copy
resolves to an empty one and every hook throws on null. `react` was deduplicated in both consumers
before this landed, on advice; the router was not, because it did not look like the same problem.
`yarn type-check` passed, `vite build` passed, and the page rendered "Something went wrong". The
smoke test found it.

**A name that said which package rather than what it does.** The slot contract shipped first as
`ApiChrome`, and the provider as `CoronaProvider`. "Chrome" means the furniture _around_ content, so
it was inaccurate for components used _inside_ it, and it collides with the Chrome this repository
automates through a skill. `CoronaProvider` named the package — which is the exact anti-pattern this
repository applies to URLs, module specifiers and translation keys. They are `ApiSlots` and
`ApiReferenceProvider`.
