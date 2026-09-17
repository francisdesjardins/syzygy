# corona

The sun's outer atmosphere — what you can see of a body once the disc itself is covered. What a
playground shows of a library, minus the part that is about which library it is.

**One directory per area**, each owning its barrel, its slot contract and its stylesheets. The entry
rule is the same for all of them and a file can fail it: **does this exist identically in both
playgrounds, and does it need to know which library it is showing?**

| Area          | What it is                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `src/api/`    | The generated reference: the contract a model must satisfy, and the viewer that renders one.        |
| `src/site/`   | The two things a playground can only do when it is being served inside a site.                      |
| `src/tokens/` | The design-system tables — the system half's names, their grouping, and the layout that shows them. |

A fourth is a fourth directory and one line in `src/index.ts`, which is the point of the layout:
where something goes stops being a decision.

```tsx
<ApiReferenceProvider slots={SLOTS} entryPoints={ENTRY_POINTS}>
  <ApiIndexPage />
</ApiReferenceProvider>
```

## The token tables

```tsx
<TokenTablesProvider slots={{ Card: SurfaceCard }}>
  <TokenSwatches tokens={PALETTE} /> {/* yours: colour is what a project rewrites */}
  <TokenScale groups={['type', 'leading']} /> {/* penumbra's: the same in every project */}
</TokenTablesProvider>
```

The seam is the one the token files already make. `SYSTEM_GROUPS` holds the system half's names and
the family each belongs to — editorial, because a reader wants leading beside the ramp rather than
beside whatever the sheet declares next to it — and **`yarn check:tokens` fails on a declaration in
`penumbra/tokens.system.css` that no group claims.** A token nobody can see is a token nobody uses.
The rule lives here rather than in penumbra because it is the viewer that owes it: the package ships
two stylesheets and should not be answerable for a consumer's table of contents.

Colour goes the other way. It is the half a project rewrites, so each playground passes its own list
with its own notes, and the chip is painted `background: var(--name)` rather than with the value the
row prints beside it — the two would have to disagree visibly for a wrong swatch to exist at all.

**The tables watch `data-color-scheme` rather than being told when to re-read**, and that
distinction cost a defect. A provider that writes the attribute from an ordinary effect writes it
_after_ its descendants' effects have run, so a table asking React when the scheme changed measures
the outgoing scheme and keeps it until the next flip. One playground used a layout effect and was
right by accident; the other was wrong the whole time.

## The generator stays with the library

corona does not run typedoc. Producing the model means walking one library's entry points, and the
two plugins that do it share only about half their lines — different entries, different categories,
different symbol handling. That is a real difference between two products, and forcing it into one
generator would be the wrong kind of sharing.

What they can agree on is the **shape they emit**. `contract.ts` is that agreement: each playground's
Vite plugin fills `virtual:api-model` with these types, and the viewer reads them without knowing
which library it is looking at.

The union in `ApiSymbol['kind']` is deliberately wider than either generator needs — only one of the
two exports a class. A generator narrower than the contract is sound; a page narrower than its own
model type is the bug, because it cannot render what the type permits.

## Slots, not components

The viewer renders through the host's components rather than owning any. Every one of them exists on
both sides and none is the same code: one `CodeBlock` takes `code` and a language, the other takes
`source`; the buttons differ on a default. Naming the contract after **what the page passes** — not
after either component — is what lets both keep their own.

They arrive through a context, because the button is needed inside the member list and the code block
inside the symbol article, four levels down. Threading five props through every node in between would
be the alternative. There is no default: a viewer rendered without its host's components throws
rather than coming up blank.

The route parameter is the host's too. The router that found a category is the host's router, so the
host reads the parameter and hands the id over.

## Two ways this failed, both silent

**A second copy of a value-carrying dependency.** Each workspace group is its own hoisting boundary,
so this package resolves its own `react` and its own `@tanstack/react-router`. A router is a _value_,
registered by the provider the host renders — a second copy resolves to an empty one and every hook
reading it throws on null. Both consumers list both in `resolve.dedupe`. Type-check and build passed;
the smoke test is what caught it.

**A stylesheet left behind.** The CSS modules travel with the components that use them. A class name
that does not resolve reads as `undefined` and renders as no class at all, which no console error
reports.
