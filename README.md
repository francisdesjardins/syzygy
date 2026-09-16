# syzygy

A syzygy is the alignment of three bodies that causes an eclipse. The packages here are the three
shadows it casts.

| package | what it is |
| --- | --- |
| [`umbra`](packages/umbra) | a headless dialog manager on the native `<dialog>` top layer |
| [`antumbra`](packages/antumbra) | a framework-free bootstrap orchestrator over a declared step graph |

> **The two names are about to trade places.** `umbra` is the root the other names derive from
> (*pen*·umbra, *ant*·umbra), so it should name the package the others build on — the bootstrapper.
> And *ante umbra*, "in front of the shadow", describes the top layer a modal `<dialog>` renders
> into. The swap is a planned step, not a mistake in this table.

`penumbra` — the design tokens both playgrounds already share — has no directory yet. It is the
first thing this repo exists to extract: today it lives as a file copied into both playgrounds,
which have already drifted apart on 6 of its 93 lines.

## Getting started

```sh
yarn install
```

Nothing else is required. Yarn 4 is vendored in `.yarn/releases`, so no global Yarn or Corepack is
involved — which matters, because Node 26 unbundled Corepack and the `yarn` on most PATHs is a 1.22
that refuses to run this project at all.

```sh
yarn check              # type-check and lint every package
yarn test               # unit and component tests
yarn verify:all         # the full gate each package defines for itself
yarn playgrounds:build  # the relocatable playground builds the site serves
```

Each package also runs standalone: `yarn workspace umbra run test`, and so on.

## History across the import

Both libraries arrived by `git subtree`, so their commits are here in full — `umbra` back to
2026-08-04, `antumbra` to 2026-09-14. But subtree merges those commits with the paths they had in
their own repository, so the usual per-file lookup finds only the merge:

```sh
git log -- packages/antumbra/src/core/types.ts   # one commit: "Add 'packages/antumbra/' from ..."
```

Ask the import point instead, using the path as it was then. The tags exist for exactly this:

```sh
git log import/antumbra -- src/core/types.ts     # the four commits that really touched it
git log import/umbra -- src/manager.ts
```

Anything committed *after* the import is found the normal way, at the current path. Only history
from before the move needs the tag.

## Layout

```
packages/     the libraries
internal/     shared code that is never published
apps/         the playgrounds, and the site's front page
```

`internal/` and `apps/` do not exist yet. They arrive as the duplication between the two
playgrounds — 28 byte-identical files, 2007 lines — is lifted out of them one extraction at a time.

## AI involvement

Substantial parts of this repository were written with AI assistance, reviewed and directed by a
human. That applies to source, tests and documentation alike.
