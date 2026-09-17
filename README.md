# syzygy

A syzygy is the alignment of three bodies that causes an eclipse. The packages here are the three
shadows it casts.

| package | what it is |
| --- | --- |
| [`umbra`](packages/umbra) | a framework-free bootstrap orchestrator over a declared step graph |
| [`antumbra`](packages/antumbra) | a headless dialog manager on the native `<dialog>` top layer |
| [`penumbra`](packages/penumbra) | the portable half of a design system: a scale with no colour, a palette with no brand, and the contrast gate over both |
| [`limb`](packages/limb) | the framework-free helpers both playgrounds need and neither owns |
| [`corona`](packages/corona) | the API reference: the contract a generated model satisfies, and its viewer |
| [`gnomon`](packages/gnomon) | the gates: the example checker, the coverage instrumenter, the formatter |

| app | what it is |
| --- | --- |
| [`home`](apps/home) | francisdesjardins.ca — the landing page, the design-system demo, and the door to the packages above |

## Ports

Assigned here, not negotiated at startup. Every config sets `strictPort`, so a taken port fails
loudly instead of sliding to the next one.

| workspace | dev | preview | component coverage |
| --- | --- | --- | --- |
| [`home`](apps/home) | 3000 | 4000 | — |
| [`antumbra`](packages/antumbra)'s playground | 3001 | 4001 | 3101 |
| [`umbra`](packages/umbra)'s playground | 3002 | 4002 | 3102 |

The slide is what made three separate failures silent, and one of them cost an afternoon: a
component suite reuses a server that is already answering, the home is an SPA whose fallback returns
**200** for any path, so `/stories?gallery=1` looked healthy and every test failed on a missing
`window.mount()`. Distinct ports remove the ambiguity; `strictPort` removes the slide that created
it. A coverage run takes its own port besides, because instrumentation is opt-in and a server
started without it reports zero counters rather than a low number.

`yarn deploy` at this root builds both playgrounds, assembles them under the home at
`/playground/dialog` and `/playground/boot`, and leaves the Cloudflare zip. **Destinations are
named after the capability, sources after the package** — a library gets renamed, and these two
already have; a URL is a promise that should outlive that.

Each name says what its package does, twice over. `umbra` is the root the other two derive from
(*pen*·umbra, *ant*·umbra), so it names the package the others build on — everything boots. It is
also the deep cone, the part of the shadow where the source is gone: the dark a bootstrapper works
in, before anything has been lit. And *ante umbra*, "in front of the shadow", is the top layer a
modal `<dialog>` renders into — while the antumbra itself is the region where the disc sits wholly
inside the source and light gets all the way around it, which is a page still visible around the
thing in front of it.

The two internal packages are named by the same rule. `limb` is the apparent edge of a disc, what an
observer actually sees of a body — the pieces of a playground that are not the library it
demonstrates. `gnomon` is the rod of a sundial, the instrument by which a shadow is measured — the
gates every package runs.

A new package takes one word from the same family, describing what it does. The family is finite and
[the vocabulary](CHANGELOG.md) is written down, which is the point of choosing one: the next name is
a decision about meaning, not about availability.

## Reading the directory names

An eclipse does not cast one shadow, it casts three, and the geometry says which is which. That is
what settles the names here — not taste.

```
   source                 occulter          apex
  ┌────────┐                 ██               ·
  │        │╲                ██               ·          ╱  antumbra
  │        │ ╲               ██╲              ·        ╱    light rings
  │        │  ╲              ██  ╲            ·      ╱      all the way
  │        │   ╲─────────────██    ╲  umbra   ·    ╱        round the disc
  │        │                 ██      ╲────────·──╱
  │        │                 ██      ╱────────·──╲
  │        │   ╱─────────────██    ╱          ·    ╲
  │        │  ╱              ██  ╱            ·      ╲
  │        │ ╱               ██╱              ·        ╲
  │        │╱                ██               ·          ╲
  └────────┘                 ██               ·

   penumbra is everything still shaded outside that cone — the soft edge
```

`umbra` is the root the other two derive from — *pen*·umbra, *ant*·umbra — which is why it names the
package everything else boots on.

**The cost of these names is real, so here is the key.** A developer arriving at this repository
looks for `utils/` and finds `limb/`. The middle column is that translation, and the rule that keeps
the names from being decoration is the last one: the word has to describe what the package *does*.

| directory | what you were looking for | the word | why it fits |
| --- | --- | --- | --- |
| `umbra` | `core`, `bootstrap` | the total shadow — and the root morpheme the other two derive from | the package the others build on: nothing is lit yet, everything boots |
| `antumbra` | `dialog`, `modal` | *ante umbra*, "in front of the shadow": past the apex, light rings around the occulter | the native `<dialog>` top layer — painted in front, the page still visible around it |
| `penumbra` | `tokens`, `theme`, `design-system` | the partial shadow, the soft half | the half of a design system that ports: a scale with no colour, a palette with no brand |
| `limb` | **`utils`**, `shared`, `common` | the apparent edge of a disc — what an observer actually sees of a body | the framework-free primitives, and nothing that needs a renderer |
| `corona` | `api-docs`, `reference` | the sun's outer atmosphere — what is visible of a body once the disc is covered | a library's public surface, and the page that shows it |
| `gnomon` | `tooling`, `scripts`, `build` | the rod of a sundial: the instrument a shadow is measured by | the gates — example checker, coverage instrumenter, formatter |
| `home` | `site`, `www` | — | the one surface that ships. `apps/` is deployed, `packages/` is depended on |

`limb` is the one that earns the table. `utils` would have told a reader where to put things but
nothing about what belongs there, and a directory that accepts anything fills up with everything.
`limb` has an entry rule it can fail: **if it needs a framework, it is not limb.** That rule is what
kept four React-coupled helpers out, and the measurement behind it is in
[its changelog](packages/limb/CHANGELOG.md).

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

Both libraries arrived by `git subtree`, so their commits are here in full — the dialog manager back
to 2026-08-04, the bootstrapper to 2026-09-14. But subtree merges those commits with the paths they
had in their own repository, so the usual per-file lookup finds only the merge:

```sh
git log -- packages/umbra/src/core/types.ts   # one commit: "Add 'packages/umbra/' from ..."
```

Ask the import point instead, using the path as it was then. The tags exist for exactly this:

```sh
git log import/boot -- src/core/types.ts     # the four commits that really touched it
git log import/dialog -- src/manager.ts
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
