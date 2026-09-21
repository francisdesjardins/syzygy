# 0025 — Shared work crosses copies through `globalThis`

- **Status**: accepted
- **Scope**: umbra

## Context

`scope: 'shared'` means a step does its work once for the whole page, however many bootstraps ask
for it — fetching the session, reading a config, opening a socket.

The natural place for that registry is module scope. It is private, it is typed, and it needs no
global.

It also does not work. **Two separately built copies of this file each get their own map and share
nothing** — which is precisely the case `shared` exists for, because two modules on a page have no
way to import each other.

## Decision

The registry is a `Symbol.for` key on `globalThis`. It is **the only global state in the package**,
and it is deliberate.

The symbol is versioned. A future shape simply does not share with the old one: **not sharing is
slower, sharing something misread is wrong.**

## Consequences

**The claim is taken synchronously, and that is what makes it a lock.** Two bootstraps reaching the
same level in the same tick both call `claimSharedStep`; an `await` anywhere before the registration
would let both win and the work would happen twice. The synchronous claim is not an optimisation and
must not be made async for tidiness.

A shared step's ending is everyone's ending — the second asker receives the first's result, including
its failure. That follows from doing the work once and is not a separate policy.

This is the exception that proves [0012](0012-the-core-reaches-no-framework.md) rather than
contradicting it: reaching `globalThis` is reaching the _platform_, which every environment this
package targets has, and which no framework owns.
