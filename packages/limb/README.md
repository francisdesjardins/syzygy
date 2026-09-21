# limb

The edge of the disc — the visible rim, the part of a body you actually see.

The framework-free machinery the playgrounds run on, in one place instead of none or two: a fuzzy
matcher, a contrast calculator and the syntax theme over it, a mutex, a single-flight gate and a
shallow comparison.

```ts
import { fuzzyRank } from 'limb/fuzzy-match';
import { readableHsl } from 'limb/color-contrast';
import { createMutex } from 'limb/mutex';
import { createSingleFlight } from 'limb/single-flight';
```

Two kinds of thing arrive here, and both are the same problem. Some existed **twice**, one copy per
playground. Others existed **once**, locked inside the app that happened to write them — which is
how the next project comes to write them a second time.

## The boundary is framework-freedom

Nothing here imports a framework at run time. `readable-syntax` names `CSSProperties`, which is a
type and is erased; `react` is an optional peer for that reason alone and never a dependency.

The boundary is not a preference — it is what the measurement found. Seven modules sat at
`shared/lib` in both playgrounds. The three with no run-time import were **byte-identical**, to the
line. The four that reach for React — a theme context, a media-query hook, a code-pane context, a
slug helper beside them — had each drifted, by 11 to 38 lines.

So the rule that gets a module in here is mechanical: if it needs a renderer, it belongs to the
playground that renders. A framework-coupled helper shared between two apps is a helper about to be
two helpers again.

## What the split is worth

One of the two copies carried all the tests. The other carried none — 279 lines of matcher and
contrast maths, imported by a search box and a code block, with nothing asserting any of it.

The 35 tests here now answer for both.

## How this repo is run

Friendly warning, so nothing here surprises you: **I commit to `main`.** No release branches, no
deprecation cycles, and **no semver** — the `1.0.0` in `package.json` is a placeholder, not a
promise. A name can change between two commits if a better one turns up, and it does.

That is a deliberate trade, not neglect. Nothing here is published, so nobody's build breaks when a
name improves; what you get instead is a surface that says what it means. The day any of it is
published, that freedom ends and the usual ceremony starts — versions, a migration note per break,
the lot. Until then the CHANGELOG records every rename, organised by date, and it explains _why_
each name moved rather than only that it did.

If you have lifted code out of `src/`, pin the commit you took it from.
