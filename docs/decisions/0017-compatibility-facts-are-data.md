# 0017 — Compatibility facts are data, not prose

- **Status**: accepted
- **Scope**: antumbra

## Context

What works with what — options against options, capabilities against the three bindings, features
against the platform — was written in prose, in five places, which disagreed.

**Inventorying the rows produced seven defects before a single cell existed.**

## Decision

The facts live in `src/__tests__/compatibility-matrix.ts` as data. `yarn docs:matrix` renders them
into `API.md`'s _Compatibility_ chapter, and a test fails when the document and the table disagree.

A new compatibility fact goes in the table, not in prose — and if it concerns one module, in that
module's JSDoc.

## Consequences

**The two kinds of ✗ are not the same fact.** There are seven cell states, because without the
split a real gap reads like a platform law: proven by a named test; works but untested; partial
with the limit written down; blocked on somebody else and on the watch list; forbidden by the
browser; refused by design, with a reason; and meaningless on that path.

Each state owes something: an open cell owes a `since`, a refusal a `why`, a blocked one a
`Recheck`.

The gate holds all of it — every option has a row, no row names an option that no longer exists,
every cited test resolves to a real file and title, a caveat carries both halves. **It cannot check
that the cited test proves the cell**; that part stays human, and saying so is part of the
decision.

`yarn todo` prints the backlog from the same data, which is why there is no `TODO.md` to drift from
it.
