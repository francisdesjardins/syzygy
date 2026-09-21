# gnomon

The rod of a sundial: the thing a shadow is measured against. These are the gates the shadow
libraries run against themselves.

| module                           | what it does                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `gnomon-examples`                | extracts every JSDoc `@example`, formats, type-checks and lints it             |
| `gnomon-doc-budget`              | word budgets per `CLAUDE.md`, and every link and named script in them resolves |
| `gnomon-token-usage`             | every `var(--app-…)` a package spends names a token one of its sheets declares |
| `gnomon-ct-coverage-report`      | merges `.nyc_output/` and prints the component suite's coverage                |
| `gnomon/vite-plugin-ct-coverage` | Istanbul instrumentation of the **source**, at `enforce: 'pre'`                |
| `gnomon/ct-coverage-reset`       | Playwright `globalSetup` that empties `.nyc_output/` once per run              |
| `gnomon/oxfmt`                   | the formatter, reading the `.oxfmtrc.json` at or above the caller              |

Private. It exists to be depended on inside this repository, not published.

## What belongs here, and what belongs in the root's `scripts/`

There are two homes for tooling in this repository, and the line between them is what each one can
see:

- **A gate that runs _inside_ one workspace is gnomon's.** It reads `process.cwd()`, answers about
  that package alone, and is invoked by its bare bin name from that package's `check` script.
- **A gate that _compares_ workspaces is the root's**, in `scripts/`. `check-capabilities` holds the
  same capability names across `deploy.mjs`, `_redirects`, a dev server and the mobile gate;
  `check-error-rule` holds two packages' copies of one rule byte-identical; `check-mobile` visits a
  site that only exists once every playground has been built into it. None of them has a single
  package to be run from.

The rule is not a preference. A per-package gate has to be a dependency to be callable as
`gnomon-doc-budget` rather than a relative path into a sibling directory, and that is what makes it
a package here; a repo-wide one has no workspace to belong to, so making it one would only invent a
cwd it then has to ignore.

## Everything is read from the package that ran the command

Nothing here resolves paths against its own location — `process.cwd()` is the package being checked,
its `package.json` names the library, and its `exports` say which entry points exist. That last one
matters more than it looks: the binding list used to be written out by hand, and it was the only
thing that differed between the two copies of the example checker. One library ends its plain entry
`/plain` and the other `/vanilla`, so a list somebody forgets to update is an entry point that
silently stops being checked.

The instrumenter is the exception and takes its `root` as an argument, because only the caller can
know it. A wrong root is the quiet failure: the filter matches nothing, and an empty report reads
exactly like a forgotten flag.

## Why the plugin's type comes from the caller

`vite` is an optional peer here and is deliberately not installed. Importing `Plugin` from it would
resolve to nothing and hand every consumer an `any`, reported by a type-aware rule at the consumer
where the cause is invisible. Installing vite instead would put a second copy beside each library's
own — and two structurally identical `Plugin` types are not assignable to one another, which is the
trap that decided this repository's hoisting boundary in the first place.

So `ctCoverage` infers its return type from the position the call sits in. That requires a position:
spread straight into an array literal it has none and arrives as `unknown`, which is what the
`unknown` default is for. Assign it to an annotated `Plugin[]` first.

## How this repo is run

Friendly warning, so nothing here surprises you: **I commit to `main`.** No release branches, no
deprecation cycles, and **no semver** — the `1.0.0` in `package.json` is a placeholder, not a
promise. A name can change between two commits if a better one turns up, and it does.

That is a deliberate trade, not neglect. Nothing here is published, so nobody's build breaks when a
name improves; what you get instead is a surface that says what it means. The day any of it is
published, that freedom ends and the usual ceremony starts — versions, a migration note per break,
the lot. Until then the CHANGELOG records every rename, organised by date, and it explains _why_
each name moved rather than only that it did.

A script name and its flags move under the same rule as everything else here.
