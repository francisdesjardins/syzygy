# 0014 — Headless-first: zero shipped UI

- **Status**: accepted
- **Scope**: antumbra

## Context

Every dialog library is asked for a button. Then a header, a footer, a confirm template, a theme.
Each one is small and each one is reasonable, and together they are the reason a dialog library
becomes something a project has to fight.

## Decision

No UI components are exported, ever. Users bring their own markup, animations, styling and layout.

The surface extends through `useDialog` rather than through new template hooks, and templates must
not expose core internals.

## Consequences

This is what makes [0013](0013-two-kinds-of-binding.md) possible: a controller binding can exist
precisely because there is no renderer to leave out.

It is also the repository's own argument, applied where it costs something — see
[0008](0008-no-component-library.md). A library that ships UI is a library whose users inherit its
taste, its markup and its upgrade schedule for the part they were most likely to want to own.

The cost is real and accepted: the quickest possible start is longer here than in a library that
hands over a styled dialog. The playgrounds absorb that cost by showing the smallest thing that
runs, early, rather than by shipping it.
