# limb

The edge of the disc — the visible rim, the part of a body you actually see.

Three helpers the two playgrounds both need and neither owns: a fuzzy matcher, a contrast
calculator, and the syntax theme built on top of it.

```ts
import { fuzzyRank } from 'limb/fuzzy-match';
import { readableHsl } from 'limb/color-contrast';
import { readableSyntaxStyle } from 'limb/readable-syntax';
```

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
