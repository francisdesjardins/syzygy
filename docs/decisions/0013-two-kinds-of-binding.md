# 0013 — Two kinds of binding, and the difference is load-bearing

- **Status**: accepted
- **Scope**: antumbra

## Context

`./react`, `./solid` and `./vanilla` look like three of the same thing. Treating them as three
meant every parity test had to special-case the third, and every document had to explain why
`vanilla` was missing half the API.

## Decision

There are two kinds, not three.

**Hook bindings** — `./react` and `./solid` — _render_. A `render` callback returns the content and
the binding returns a `Dialog` to place. They share a surface down to the file names, which
`binding-parity.test.ts` holds.

**The controller binding** — `./vanilla` — _does not render_, and could not without the library
shipping a renderer, which is the one thing it refuses to do ([0014](0014-headless-first.md)). The
`<dialog>` and its contents are markup the caller already wrote, and `bindDialog` drives the
lifecycle over it.

## Consequences

`./vanilla` has no `render`, no `Dialog` and no outlet, and it gains
`bindAction(button, { reason })`, which does the half a renderer does elsewhere — and which is a
member of the returned controller rather than an export.

`binding-parity.test.ts` knows the difference and asserts **each kind's own shape**, rather than
one shape with exceptions.

Three differences between the two hook bindings are the renderer's and not the library's: Solid's
live values are getters over signals, so the render args must not be destructured; `useLookup`
returns an accessor; and `portal: true` mounts the dialog itself, leaving `Dialog` as `null`.
