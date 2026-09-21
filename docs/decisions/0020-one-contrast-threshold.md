# 0020 — One contrast threshold, and it is the one you can look up

- **Status**: accepted
- **Scope**: penumbra, limb

## Context

Relative luminance needs a threshold below which a channel is linear. Two numbers are in
circulation and both are correct citations:

- `0.04045` — the sRGB transfer function's own threshold.
- `0.03928` — what WCAG 2.x writes, carried from an early draft of that function.

Two copies of the calculation exist here, in `penumbra/scripts/check-contrast.mjs` and in `limb`'s
`color-contrast.ts`, so the choice had to be made twice or it would be made inconsistently.

## Decision

Both use `0.04045`, with the same comment naming the other number and why it was not chosen.

## Consequences

**The choice cannot change a result.** Working in 8-bit colour, a channel is `n / 255` for an
integer `n`, and the window between the two thresholds contains no such value — no 8-bit channel
falls between them. Every pair this repository can express scores identically either way.

So the tie-break is not accuracy, it is what a reader can verify. `0.04045` is the number in the
sRGB specification; `0.03928` is a number that only makes sense once you know it came from a draft.

The two copies are a deliberate duplication, not a divergence: a script that runs before anything
is built cannot import from a package, and `limb` cannot depend on a build script. The comment in
each names the other, which is what stops them drifting apart —
[0011](0011-what-is-deliberately-different.md) is the general form of this.
