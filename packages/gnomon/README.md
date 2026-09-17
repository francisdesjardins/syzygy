# gnomon

The rod of a sundial: the thing a shadow is measured against. These are the gates the shadow
libraries run against themselves.

| module                           | what it does                                                       |
| -------------------------------- | ------------------------------------------------------------------ |
| `gnomon-examples`                | extracts every JSDoc `@example`, formats, type-checks and lints it |
| `gnomon-ct-coverage-report`      | merges `.nyc_output/` and prints the component suite's coverage    |
| `gnomon/vite-plugin-ct-coverage` | Istanbul instrumentation of the **source**, at `enforce: 'pre'`    |
| `gnomon/ct-coverage-reset`       | Playwright `globalSetup` that empties `.nyc_output/` once per run  |
| `gnomon/oxfmt`                   | the formatter, reading the `.oxfmtrc.json` at or above the caller  |

Private. It exists to be depended on inside this repository, not published.

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
