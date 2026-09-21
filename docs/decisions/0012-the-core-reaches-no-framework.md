# 0012 — The core reaches no framework

- **Status**: accepted
- **Scope**: antumbra, umbra

## Context

A dialog manager has to run inside React, Solid, or no framework at all. The usual shape is a React
library with an escape hatch. The escape hatch is then the part that rots, because nothing in the
build fails when it stops working.

## Decision

The package root is plain TypeScript and **must resolve with no framework installed**. Bindings —
`./react`, `./solid`, `./vanilla` — are the optional layer, and each one is the only part that
knows which environment it is in.

The test for what belongs in the core is mechanical: **if adding it to one binding would mean
adding it to the other, it is core.** That is how the `attach*` functions, the action factory, the
dialog attributes, the slide geometry and the default animation got there.

## Consequences

**Entry-point isolation is a test, not a convention.** `entry-isolation.test.ts` walks the real
import graph from each entry and asserts that the root reaches no framework, that each hook binding
reaches its own and only its own, and that `./vanilla` reaches none. The positive halves matter as
much as the negative one — they are what stops the root's assertion from passing because the walker
resolved nothing. This is [0006](0006-gates-measure-the-artifact.md) applied.

`peerDependenciesMeta` marks the three optional, which is the promise those tests defend, and
`verify:package` re-checks it against the built artifact.

`antumbra/solid` is what keeps the rule honest. A core that only ever ran under React would drift
into React's assumptions without anybody noticing; a second renderer makes the drift fail.

Adding a fourth binding means a sibling of `src/react.ts` and a new `exports` entry. Nothing under
the root changes.

Each binding also re-exports the root wholesale, so an application imports from one path.
