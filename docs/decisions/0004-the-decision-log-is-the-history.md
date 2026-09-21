# 0004 — The decision log is the history

- **Status**: accepted, superseding the CHANGELOG-as-memory rule
- **Scope**: the repository

## Context

Code comments here say **why, not what, and never the past** — no `used to`, no `previously`. A
comment states the invariant that holds now. That rule is good and it is gated
(`yarn comment-budget`).

It had a side effect nobody chose. The reasoning had to go somewhere, and the only place left was
the CHANGELOG, whose own header came to read: _"This file is the project's memory. The code
comments never narrate history, so the reasoning behind a decision lives here and nowhere else."_

So a changelog became a decision store, and it inherited the one property a decision store must not
have: **it is append-only and ordered by date.** Measured across antumbra's file — 73 entries over
51 days, 102 589 words — **174 identifiers appear on four or more separate dates**. `useModal`
appears on twenty-one. Knowing where one decision landed meant replaying fifty-one days in order.

The most revisited subject in the file is filed under a name that no longer exists: `useModal` is
`useDialog`, and a reader searching the current name finds none of its twenty-one entries.

## Decision

Decisions live in `docs/decisions/`, one file per decision, numbered, with a `Status` field.

**A decision is not appended to, it is changed.** When one reverses, its status becomes
`superseded by NNNN` and the successor is written. The current state is readable without reading
the history, which is the whole difference from a dated log.

The CHANGELOGs are frozen where they stand and kept as the archive an ADR's `History` section
points back into. They are not rewritten: a changelog that edits its own past is a story, not a
record, and that was true when it was written.

## Consequences

Comments and `CLAUDE.md` files point here instead of re-arguing. `gnomon`'s `NARRATING` message
names this log. `check-doc-budget.mjs` already walks every `CLAUDE.md` and resolves every link, so
a reference that rots fails a gate — **no new gate was added for this**.

A dated changelog still answers _what changed that day_, in one line, pointing at a decision. It
cannot be a migration guide, because of [0001](0001-nothing-here-is-published.md).
