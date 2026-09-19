# CLAUDE.md

The shell all three playgrounds wear. No product of its own: every page here is drawn for umbra,
penumbra and antumbra at once, and anything only one of them needs stays in that one.

## Commands

```bash
yarn dev             # the component stories, for building one in isolation
yarn check           # type-check + lint + format + tokens + this document's budget
yarn test            # the unit suite, then the component suite in a real browser
yarn verify:all      # check + test
```

`yarn check:tokens` holds that every system token is filed in exactly one group;
`yarn check:tokens:used` holds that nothing here reads a token no sheet declares. `yarn doc-budget`
is part of `yarn check`, so this document has a ceiling like every other one in the repository.

**`yarn test` is two projects.** The unit half is Node; the component half drives real stories in a
browser, which is the only way a slot contract is exercised rather than merely type-checked.

## There is no barrel, on purpose

`corona` has no `.` export. Import from the area that owns the name — `corona/shell`,
`corona/theme`, `corona/icons`, `corona/mascot`, `corona/site`, `corona/tokens`, `corona/api`.

**A barrel is a foot-gun here rather than a convenience.** Vite serves modules unbundled in dev, so
`import { AppButton } from 'corona'` pays for every area whatever the named import says — the same
reasoning both playgrounds already spell out for `react-syntax-highlighter`. The rule is structural
rather than written down twice: the barrel does not exist, so nobody can reach for it.

Two of the three playgrounds went through the barrel and the third never did, which is how one
package came to have two house styles.

## The areas

One directory per area, each with its own `index.ts`, its own slot contract and its own stylesheets.
Adding a second costs a directory and an entry in `exports`, rather than a decision about where
anything goes.

| Area     | What is in it                                                                  |
| -------- | ------------------------------------------------------------------------------ |
| `shell`  | `AppShell` and what it composes — bar, drawer, layout, card, buttons           |
| `code`   | `CodeBlock`, its lazy twin, `HighlightedCode`, `CopyButton`                    |
| `theme`  | the scheme context and its toggle                                              |
| `tokens` | the token tables the design pages render, through `TokenSlots`                 |
| `api`    | the reference pages, through `ApiSlots` — each playground brings its own model |
| `site`   | `PLAYGROUNDS` and `SITE`                                                       |
| `mascot` | `PeekingMoon`, `EclipseMoon`                                                   |
| `icons`  | the twelve the shell uses                                                      |

**A page here takes its data through a slot contract, never through a fetch.** `ApiSlots` and
`TokenSlots` are what let one reference page serve three different models.

## What stays with the playground

**Four things, and `AppShell` asks for exactly them**: a name, a mark, a set of routes and a moon.
Everything else about the chrome is drawn here. The rule generalises — when two playgrounds differ
inside a shared component, the difference becomes a prop and the component stays here; it does not
become a second copy. The ring, the terminator and `EclipseMark` are marks, not bars.

**A surface a colour is measured against is a literal, not a `var()`.** `HighlightedCode` raises
every token to 4.5:1 against the background the code is painted on, and a custom property cannot be
measured — so `SURFACE` is spelled out and must equal `--app-paper`. It was spelled out twice once,
and the second copy drifted.

**`SurfaceCard` takes no `className` and no `sx`.** That escape hatch is what let one playground's
cards drift apart before the three drifted from each other.

## `PLAYGROUNDS` is the only place the three are named

`site/playgrounds.ts`, and the order is the eclipse, outward from the middle: umbra is the full
shadow, penumbra the partial one around it, antumbra beyond the umbra's tip. The home page shows the
same three, and the root's `check:capabilities` fails when the two orders disagree.

**A slug is a capability; a name is a package.** A package is renamed the day a better word turns
up, and a deployed URL that followed it would break every link anybody kept.

## Environment

React 19 and `@tanstack/react-router` are **peers**, not dependencies: the playground owns the
version, and two copies of a router are two route trees. `penumbra`, `limb` and
`react-syntax-highlighter` are the real dependencies — the tokens every surface reads, the small
helpers, and the grammars `corona/code` registers.

**The highlighter is imported through deep paths, never its barrels**: they re-export the whole
Prism build and all 47 themes, which unbundled dev serving makes a named import pay for in full.
`code/react-syntax-highlighter-subpaths.d.ts` restates their types, because a successful resolution
to the shipped `.js` is not reconsidered against the ambient declaration beside it.

## Conventions

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- **Changelog**: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date
- **Files**: PascalCase for components, kebab-case for everything else
- **Comments**: **why, not what** — and never the past; the CHANGELOG is the history. JSDoc on the
  public surface is the exception, being the documentation.
