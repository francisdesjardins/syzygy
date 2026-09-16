# syzygy

A syzygy is the alignment of three bodies that causes an eclipse. The packages here are the three
shadows it casts.

| package | what it is |
| --- | --- |
| [`umbra`](packages/umbra) | a headless dialog manager on the native `<dialog>` top layer |
| [`antumbra`](packages/antumbra) | a framework-free bootstrap orchestrator over a declared step graph |
| [`penumbra`](packages/penumbra) | the portable half of a design system: no colour, no typeface |

> **The two names are about to trade places.** `umbra` is the root the other names derive from
> (*pen*·umbra, *ant*·umbra), so it should name the package the others build on — the bootstrapper.
> And *ante umbra*, "in front of the shadow", describes the top layer a modal `<dialog>` renders
> into. The swap is a planned step, not a mistake in this table.

Two more are planned, and the rule for naming them is the rule above: one word from the same family,
describing what the package does. `limb` — the apparent edge of a disc, what an observer actually
sees of a body — for the playground shell both playgrounds render. `gnomon` — the rod of a sundial,
the instrument by which a shadow is measured — for the gates.

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
packages/     every library, published or not
apps/         the playgrounds, and the site's front page
```

`packages/` is flat and every directory in it is one word from the same family. Whether a package
ships is `private: true` in its manifest, not a level of the tree — a shared internal utility is
still a package, and giving it a folder that announces its privacy buys nothing.

`apps/` does not exist yet. It arrives as the duplication between the two playgrounds — 28
byte-identical files, 2007 lines — is lifted out of them one extraction at a time.

## AI involvement

Substantial parts of this repository were written with AI assistance, reviewed and directed by a
human. That applies to source, tests and documentation alike.
