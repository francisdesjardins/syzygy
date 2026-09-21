# 0008 — No component library anywhere

- **Status**: accepted
- **Scope**: the repository

## Context

Four front ends are maintained here: three playgrounds and the site. Every one of them is a
candidate for a component library, and the argument for adding one is always the same — it is
faster today.

The site had MUI, for ten primitives.

## Decision

No component library in the tree. The playgrounds are CSS modules over `penumbra`'s tokens, and the
site is too, since MUI was dropped.

## Consequences

The one exception is deliberate and scoped: antumbra's `MuiIsland` is **the subject of a card**, a
worked example of a dialog driving somebody else's components — not a dependency of a shell. Its
`no-restricted-imports` rule lives in that one workspace, because a restriction on an import the
other workspaces cannot resolve is a rule that cannot fail.

This is the repository's own argument applied to itself. A library is worth its place the day the
requirements outgrow what you would write; ten primitives is not that day, and the cost of a
dependency never arrives on the day it is added.

What that leaves genuinely shared, and what stays apart, is
[0011](0011-what-is-deliberately-different.md).
