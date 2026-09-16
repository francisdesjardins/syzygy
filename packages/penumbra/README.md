# penumbra

The partial shadow — the soft half of an eclipse, and the half of a design system that ports.

`tokens.system.css` is scale, rhythm, motion and stacking. **No colour and no typeface are in it**,
which is the entire point: a project takes this file unchanged and writes its own skin beside it.

```css
@import 'penumbra/tokens.system.css';
@import './tokens.skin.css'; /* yours */
```

## Why the split has a gate

This file existed twice — one copy per playground — and its own header predicted that the day the
two projects shared a monorepo, the copies would collapse into one package. They had already drifted
by then, though only in that header's wording: not one declaration differed. The prose rule held for
months and then the file moved anyway, which is the argument for a check rather than a comment.

`yarn check` here refuses a colour or a typeface in the system half, and refuses a sheet that has
become suspiciously small — an empty file satisfies every other rule trivially.

## What a skin owes

A skin defines the palette, the typefaces and their dark-scheme counterparts under
`:root[data-color-scheme='dark']`. Two rules are carried in the token *names* so nobody has to read
a comment to obey them:

- **`--app-flame` is a fill; `--app-accent` is the ink.** A brand colour bright enough to fill with
  is rarely dark enough to read as text.
- **A filled primary hovers *away from its ink*.** Which direction that is depends on the scheme:
  where the ink is white the fill deepens, where the ink is dark the fill brightens. Getting it
  backwards is not a taste question — it is a contrast failure, and the first indigo tried for one
  of these skins measured 4.22:1 and was refused.

Pairs are measured rather than chosen. Each consuming project runs its own contrast audit over its
own skin; penumbra has no colours to audit.

## Not shipped here, on purpose

A reference skin. Shipping one would make it the default, and a default palette is exactly the thing
the next project would inherit without choosing. The two skins in this repo are worth reading as
examples — they are deliberately nothing alike.
