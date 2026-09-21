# 0006 — Gates measure the artifact, not a declared list

- **Status**: accepted
- **Scope**: the repository

## Context

The cheap way to write a gate is to give it a list: the files to check, the routes to walk, the
tokens that exist. The list is written once, by someone who can see the whole tree that day.

A hand-kept index is what a new file gets left off. The gate then passes, which is worse than not
having it — it reports coverage it does not have.

## Decision

A gate discovers its subject rather than being told it. It walks the import graph, the directory,
the built output, or the manifest — whatever the real artifact is — and fails on what it finds
there.

## Consequences

`entry-isolation.test.ts` walks the real import graph from each entry point rather than checking a
list of allowed imports. `check:capabilities` reads the route list out of `deploy.mjs`, which is
the source, and holds four places to it. `check:layout` walks every element of every assembled
route and measures pixels. `check-token-coverage` asserts every token is on a page, both
directions.

**It also means a gate's blind spots are a property to write down, not to discover later.**
`check:layout` skips anything inside a declared scroll container, on purpose, because a scroller
that scrolls is doing its job — so it cannot see a graph outgrowing its page, and the comment where
the widths are chosen says exactly that. A gate that is trusted for something it does not do is
worse than one that is not trusted at all.

The register of what this produced is [0011](0011-what-is-deliberately-different.md).
