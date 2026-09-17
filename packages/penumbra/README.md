# penumbra

The partial shadow — the soft half of an eclipse, and the half of a design system that ports.

Two sheets, and neither carries a brand. `tokens.system.css` is scale, rhythm, motion and stacking,
with **no colour and no typeface in it at all**. `tokens.skin.base.css` is colour, and carries only
the part every project needs and none of them decides differently: surfaces, three ranks of text, a
divider, a control edge, the four semantics with their washes, a scrim, the scrollbar, and one soft
lift. What is left for a project to write is a typeface and eight colours.

```css
@import 'penumbra/tokens.system.css';
@import 'penumbra/tokens.skin.base.css';
@import './tokens.skin.css'; /* yours */
```

Take the base or leave it. A project that wants none of it imports the system half alone and
declares all 24 names itself; a project that wants most of it overrides one by declaring it anyway,
which is a deliberate act and reads as one.

## Why the split has a gate

`tokens.system.css` existed twice — one copy per playground — and its own header predicted that the
day the two projects shared a monorepo, the copies would collapse into one package. They had already
drifted by then, though only in that header's wording: not one declaration differed. The prose rule
held for months and then the file moved anyway, which is the argument for a check rather than a
comment.

`yarn check` runs the rule in both directions. The system half refuses a colour or a typeface. The
base refuses a typeface, refuses the names a project paints itself with, and refuses any token the
system half already declares — two files answering for one name means the winner is import order
rather than intent. Both refuse a sheet that has become suspiciously small, since an empty file
satisfies every other rule trivially.

## What a skin owes

A skin defines the eight brand colours, the typefaces and their dark-scheme counterparts under
`:root[data-color-scheme='dark']`. Two rules are carried in the token *names* so nobody has to read
a comment to obey them:

- **`--app-flame` is a fill; `--app-accent` is the ink.** A brand colour bright enough to fill with
  is rarely dark enough to read as text.
- **A filled primary hovers *away from its ink*.** Which direction that is depends on the scheme:
  where the ink is white the fill deepens, where the ink is dark the fill brightens. Getting it
  backwards is not a taste question — it is a contrast failure, and the first indigo tried for one
  of these skins measured 4.22:1 and was refused.

Pairs are measured rather than chosen, and the gate is `penumbra-contrast`, shipped here for the
same reason the pair table is: `--app-primary-ink on --app-primary` owes 4.5:1 because of what
those two names mean, and a consumer keeping its own copy of that table would be maintaining a
definition it does not own.

```bash
penumbra-contrast tokens.skin.css             # the base, then your skin over it
penumbra-contrast --no-base tokens.skin.css   # you replaced the base outright
penumbra-contrast                             # the base alone; brand pairs do not apply
```

Sixteen pairs in both schemes, eleven of which are the base's own — which is why the eleven are
measured on every run and the five that need a brand token only once a skin exists.

## Not shipped here, on purpose

A palette. The base is a ground and a set of semantics — the colours a project inherits without
losing anything it would have chosen. A brand is the opposite, and shipping one would make it the
default nobody picked.

The two skins in this repo are what is left after that subtraction: twelve declarations each, and
they are nothing alike.
