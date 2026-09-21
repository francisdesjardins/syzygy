# syzygy

A syzygy is the alignment of three bodies that causes an eclipse. The packages here are the three
shadows it casts.

| package                         | what it is                                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [`umbra`](packages/umbra)       | a framework-free bootstrap orchestrator over a declared step graph                                                     |
| [`antumbra`](packages/antumbra) | a headless dialog manager on the native `<dialog>` top layer                                                           |
| [`penumbra`](packages/penumbra) | the portable half of a design system: a scale with no colour, a palette with no brand, and the contrast gate over both |
| [`limb`](packages/limb)         | the framework-free helpers the two libraries' playgrounds need and neither owns                                        |
| [`corona`](packages/corona)     | what a playground shows of a library, minus which library: the reference, the token tables, the site links             |
| [`gnomon`](packages/gnomon)     | the gates: the example checker, the coverage instrumenter, the formatter                                               |

| app                 | what it is                                                                  |
| ------------------- | --------------------------------------------------------------------------- |
| [`home`](apps/home) | francisdesjardins.ca — the landing page, and the door to the packages above |

## Ports

Assigned here, not negotiated at startup. Every config sets `strictPort`, so a taken port fails
loudly instead of sliding to the next one.

| workspace                                    | dev  | preview | component coverage |
| -------------------------------------------- | ---- | ------- | ------------------ |
| [`home`](apps/home)                          | 3000 | 4000    | —                  |
| [`antumbra`](packages/antumbra)'s playground | 3001 | 4001    | 3101               |
| [`umbra`](packages/umbra)'s playground       | 3002 | 4002    | 3102               |
| [`penumbra`](packages/penumbra)'s playground | 3004 | 4004    | —                  |

The slide is what made three separate failures silent, and one of them cost an afternoon: a
component suite reuses a server that is already answering, the home is an SPA whose fallback returns
**200** for any path, so `/stories?gallery=1` looked healthy and every test failed on a missing
`window.mount()`. Distinct ports remove the ambiguity; `strictPort` removes the slide that created
it. A coverage run takes its own port besides, because instrumentation is opt-in and a server
started without it reports zero counters rather than a low number.

`yarn deploy` at this root builds all three playgrounds, assembles them under the home at
`/playground/dialog`, `/playground/boot` and `/playground/design`, and leaves the Cloudflare zip. **Destinations are
named after the capability, sources after the package** — a library gets renamed, and these two
already have; a URL is a promise that should outlive that.

Each name says what its package does, twice over. `umbra` is the root the other two derive from
(_pen_·umbra, _ant_·umbra), so it names the package the others build on — everything boots. It is
also the deep cone, the part of the shadow where the source is gone: the dark a bootstrapper works
in, before anything has been lit. And _ante umbra_, "in front of the shadow", is the top layer a
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

`umbra` is the root the other two derive from — _pen_·umbra, _ant_·umbra — which is why it names the
package everything else boots on.

**The cost of these names is real, so here is the key.** A developer arriving at this repository
looks for `utils/` and finds `limb/`. The middle column is that translation, and the rule that keeps
the names from being decoration is the last one: the word has to describe what the package _does_.

| directory  | what you were looking for          | the word                                                                               | why it fits                                                                             |
| ---------- | ---------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `umbra`    | `core`, `bootstrap`                | the total shadow — and the root morpheme the other two derive from                     | the package the others build on: nothing is lit yet, everything boots                   |
| `antumbra` | `dialog`, `modal`                  | _ante umbra_, "in front of the shadow": past the apex, light rings around the occulter | the native `<dialog>` top layer — painted in front, the page still visible around it    |
| `penumbra` | `tokens`, `theme`, `design-system` | the partial shadow, the soft half                                                      | the half of a design system that ports: a scale with no colour, a palette with no brand |
| `limb`     | **`utils`**, `shared`, `common`    | the apparent edge of a disc — what an observer actually sees of a body                 | the framework-free primitives, and nothing that needs a renderer                        |
| `corona`   | `api-docs`, `reference`            | the sun's outer atmosphere — what is visible of a body once the disc is covered        | the pages the playgrounds render, minus the part that knows which library               |
| `gnomon`   | `tooling`, `scripts`, `build`      | the rod of a sundial: the instrument a shadow is measured by                           | the gates — example checker, coverage instrumenter, formatter                           |
| `home`     | `site`, `www`                      | —                                                                                      | the one surface that ships. `apps/` is deployed, `packages/` is depended on             |

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
yarn check              # format and lint every file, then each package's own gate
yarn test               # unit and component tests
yarn verify:all         # the full gate each package defines for itself
yarn playgrounds:build  # the relocatable playground builds the site serves
yarn deploy             # assemble the site, then:
yarn check:layout       # drive the assembled site at two phone and two desktop widths
```

Each package also runs standalone: `yarn workspace umbra run test`, and so on.

**`check:layout` is separate because it needs the assembled site**, not a package. It loads
`apps/home/dist` — the playgrounds included, at the paths the site serves them from — in a real
browser at 390px and 360px, and asserts three things per route: nothing crosses the right edge, the
drawer opens with its links on screen, and every dialog the page can open stays inside the viewport.

It exists because both halves have gone wrong here and nothing else could see either. A unit test, a
type-check and a contrast measurement all pass through a navigation drawer that never slides in.
Writing it found one: at 360px the shared site link pushed the theme toggle eleven pixels off the
top bar, on every route of one playground.

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

Anything committed _after_ the import is found the normal way, at the current path. Only history
from before the move needs the tag.

## Layout

```
packages/          every library, published or not
apps/              what is deployed
tsconfig.base.json the strictness; each workspace extends it
.oxlintrc.json     the lint surface; each workspace extends it
.oxfmtrc.json      the house style, for the whole tree
yarn.config.cjs    what the manifests are not allowed to disagree about
```

`packages/` is flat and every directory in it is one word from the same family. Whether a package
ships is `private: true` in its manifest, not a level of the tree — a shared internal utility is
still a package, and giving it a folder that announces its privacy buys nothing.

`apps/` holds the one surface that is deployed. Each playground still builds and runs inside its own
package, because a demo that cannot run without the site is a demo that stops being run.

**The files at the root are one tool decision each, made once.** Every workspace runs the same oxc
pair — oxlint with its type-aware half on tsgolint, and oxfmt — against the same TypeScript 7; there
is no eslint and no prettier anywhere in the tree. A workspace's `tsconfig.json` and `.oxlintrc.json`
are `extends` plus what is genuinely its own — the libraries it needs, the globs only it has — and
none has a formatter config at all, because oxfmt walks up.

**What a workspace still declares for itself is the interesting part of each file**, and what it no
longer declares is the part that had drifted: the same 82 lint rules were maintained in five places,
and `apps/home` was quietly missing four of the strictness options every package had.

**The root's own `format:check` and `lint` cover the whole tree**, not just the root — and oxc reads
a nested config on a run started above it, so each workspace is still linted by its own rules. That
is how `penumbra` and `gnomon` turn out to have been formatted and linted by nothing at all: neither
has a build, so neither has a `check` that ran either tool, and gnomon is 869 lines of the gates
themselves. Each workspace keeps its own `lint` and `format` so it runs standalone; the root's are
what make "every file" true.

## What is shared, and what is not

Two decisions carry it: [what is shared and which gate holds it](docs/decisions/0022-the-shared-surface.md),
and [what is deliberately still different](docs/decisions/0011-what-is-deliberately-different.md).

Both are needed, because the second list is the one that rots. A divergence nobody decided on and
nobody is tracking reads exactly like one that was argued for — and the cheapest way to look
thorough is to unify something that should not be.

## AI involvement

Substantial parts of this repository were written with AI assistance, reviewed and directed by a
human. That applies to source, tests and documentation alike.
