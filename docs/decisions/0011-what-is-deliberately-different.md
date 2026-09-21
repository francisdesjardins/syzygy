# 0011 — What is deliberately different

- **Status**: accepted
- **Scope**: the repository

## Context

The point of this repository is to combine and normalise everything that is genuinely shared. That
only means something if the other half is written down too.

The danger is not a divergence somebody chose. It is a divergence **nobody decided on and nobody is
tracking** — and the cheapest way to look thorough is to unify something that should not be.

## Decision

Each of the following was looked at and kept apart. The reason is the value of the entry: without
it, the next reader rediscovers the question and unifies it by accident.

**`SurfaceCard`** is a slot the playgrounds fill, not a component `corona` owns. One is a hairline
and a radius; the other lifts on hover behind a corona. Sharing them costs one of the two products
its own surface.

**The two API generators.** `vite-plugins/api-model.ts` exists twice and the copies share about
half their lines — different entry points, different categories, different symbol handling. That is
a real difference between two products. What they agree on is the _shape they emit_, and that
agreement is `corona`'s `contract.ts`.

**The palettes.** Each project's `tokens.skin.css` is eleven or twelve declarations — three faces
and the brand. Colour is the half a project rewrites; the neutral half underneath is
`penumbra/tokens.skin.base.css` and is shared. The seam is where the token files already put it.

**Twelve script names**, each with its reason in `yarn.config.cjs`. `type-check` runs two programs
in a library and one in an app; `test:component` differs because antumbra has touch and focus
projects umbra has not.

**`lib` and `types` in each `tsconfig.json`.** `DOM.Iterable` where a `NodeList` is walked,
`vite/client` in the app that needs it. Adding either everywhere claims a capability the package
does not use.

**`createStore` exists twice and was never a collision.** umbra's is 56 lines, antumbra's 198, and
212 of 254 lines differ — but only antumbra _exports the function_. umbra publishes the
`ReadableStore` and `Store` types and keeps the builder internal, so no application can import
both. Two internals sharing a name are not a divergence, and renaming one to fix a clash nobody can
hit is churn.

**Two playgrounds have a smoke probe and the third does not.** antumbra's and umbra's walk their
routes and drive flows — dialogs, a code viewer, typed close payloads, a sticky jump bar. penumbra's
playground is four static routes of token tables with nothing to drive, so those flows would be
empty, and the half that would not be is already done: `check:layout` walks those four routes at
four widths and fails on a `pageerror` or a `console.error`. Writing a third probe to match the
other two would be symmetry bought with maintenance.

**Three things did not move into `corona`**, each for a reason. antumbra's `PageLayout` is a
superset, with a `result` panel backed by a component only it has, across 29 call sites. Its
`ThemeProvider` differs in substance — it feeds a template token set and writes from a layout
effect. `SurfaceCard` is the slot above.

## Consequences

A line leaves this document by being fixed or by being argued into it. Anything that is neither is
the thing to worry about.

This and [0022](0022-the-shared-surface.md) together replace the hand-kept register that was
`NORMALIZATION.md`, which carried a "last measured" date and was stale four days after it was
stamped. Neither of them carries a date, because neither is a measurement.
