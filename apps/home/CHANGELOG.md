# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the app's memory.** The code states what holds now; why it came to hold lives here.

## 2026-09-17, the design system leaves the site

### Removed

`/design-system`, its page, the two example skins and the specimen stylesheet. All of it is
[penumbra](../../packages/penumbra)'s playground now, at `/playground/design`.

**Why it was here at all is the answer to why it left.** This site is a showcase; the three
projects are playgrounds. Penumbra was the odd one — its only shopfront was a page _of_ the
showcase, which made a stylesheet read as one of three works rather than as the thing the other two
are built on. 266 of home's 1 189 lines, and every one of them about somebody else's package.

The work row now points at three builds instead of two and a page. The structured data names
`/playground/design/` for penumbra, which is where it is.

### Changed

`check:contrast` measures this site's own skin and nothing else; the two example skins are measured
where they are shown. `App.tsx` has one route and no lazy boundary — there is nothing left to split
off the landing page.

## 2026-09-17, building blocks, and the head says so too

### Changed

The page called this front-end work. It is not, and the libraries behind it had been saying so for
months: umbra's core reaches no framework and needs no DOM — `entry-isolation.test.ts` walks the
import graph and fails if it ever does — so one declared graph boots a page, a worker or a service
equally. The copy now says what the code already proved.

- The lead line is **"Infrastructure engineer — building blocks, client side and server side"**.
- _What I build_ gained a second paragraph, because the claim is about the habits and not only the
  runtime: derive behaviour from what was declared rather than adding a flag for it, write the
  refusals down before the features, and put a gate where a convention would otherwise be a comment
  nobody re-reads.
- _What's running_ said "two libraries" over a list of three, and umbra's blurb led with the
  orchestration rather than with the fact that it is not a front-end one.

antumbra is still a front-end library — it is dialogs on the native top layer, and pretending
otherwise would be the same overclaim in the other direction.

### Changed — the robot half says the same thing

`#root` is empty until the bundle runs. Googlebot runs it; Slack, LinkedIn, X and iMessage do not,
so for them `index.html`'s head **is** the page. It said "Web Developer" and described reactive
state systems, which is neither what the application said nor what the work is.

The head now carries the same four sentences the application renders, and the structured data is a
`@graph` rather than a lone `Person`: the person with a `jobTitle`, then umbra, antumbra and
penumbra as `SoftwareSourceCode` nodes, each pointing at the surface a reader can open. umbra's
`runtimePlatform` is `["Browser", "Node.js", "Web Worker"]`, which is the claim stated where a
machine can read it. `codeRepository` is deliberately absent: the repository is not public, and a
field pointing at a 404 is worse than a missing one.

`knowsAbout` was nine front-end topics. It is thirteen now, and orchestration, dependency graphs
and concurrency are among them.

**`robots.txt` no longer disallows `/playground/`.** It called them "development and testing
routes"; they are the work this page exists to point at, each a built and documented site, and the
landing page has linked to them the whole time. They are in the sitemap now, along with
`/design-system`, whose `lastmod` dates had been a year stale.

### Added

`yarn check:head` — the head, the application's `seo.home.*` and the token sheet have to agree.
Four sentences compared verbatim across `index.html` and `en/common.json`, the French checked for
presence, and the two colours in `index.html` and `manifest.json` compared against
`--app-primary` and `--app-bg`. Both were still MUI's default blue, `#1976d2`, which is exactly the
drift the gate exists to catch — a palette outside the token sheets, one layer below where
`check:literals` can see.

### Changed — the manifest

Its description had no relation to the page, `lang: "en"` on a bilingual site was a claim it could
not keep, and its two colours are tokens now.

## 2026-09-17, the palette stops being MUI's

### Changed

`src/styles/tokens.skin.css` is the palette now — eleven declarations, three typefaces and the
eight colours this site paints itself with — over `penumbra/tokens.skin.base.css`, which
`main.tsx` imports between the system half and it.

**`useTheme` resolves the token names off the document instead of carrying hexadecimal.**
`primary.main` is `--app-primary`, `background.paper` is `--app-paper`, `divider` is
`--app-divider`, and so on down to the scrollbar. The argument for keeping colour in MUI was that
components have to read it from the theme anyway and two sources drift apart; that was right about
the drift and wrong about which source. The theme reads the palette; it is not one.

`main.tsx` imports the three sheets before `./App`, because a theme built at module scope out of
values the document has not parsed is a theme built out of nothing.

**`data-color-scheme` is stamped on `:root`.** Penumbra's dark block answers to it, so the toggle
now switches the whole palette rather than only the MUI half — and the attribute is set before the
theme is read, since the theme is read from the palette.

### Changed — what moved on screen

The brand did not: the fuchsia, both faces and every type size came through byte-identical, measured
element by element in both schemes before and after. What moved is the neutral half, which is now
the base's:

- **Light** shifts from a fuchsia-traced ground (`#F4F0F2`) to the base's slate-traced `#f4f6fa`,
  and the text ranks from black at 87% and 60% to `#0b1120` and `#4a5568`. Side by side the ground
  reads a shade cooler; alone it reads the same.
- **Dark stops being flat.** MUI's dark defaults give `background.default` and `background.paper`
  the same `#121212`, so the card was separated from the page by nothing but a 12%-white hairline.
  The base gives `#0b1120` and `#111a2b`, which separate.

The ground's fuchsia trace was a decision this site made while it owned its palette alone. It is one
of three surfaces sharing a design system now, and reading as their sibling is worth more than a
trace nobody could name. One declaration puts it back.

The dark scheme's `primary` also gained an ink it could carry: MUI paired `contrastText: #fff` with
`#FF8BC4`, which is **1.94:1**. Nothing on this site fills with primary, so it never shipped — and
nothing would have caught it either, which is the other half of why the palette moved.

### Added

`yarn check:literals` — a hexadecimal in `src/**/*.tsx` fails the check. A colour in a component is
a second palette starting: correct the day it is written, blind to the colour scheme, and invisible
to `check:contrast`, which measures the tokens. Stylesheets are exempt by definition.

It caught the one that was left — the card's `0 4px 20px rgba(0,0,0,0.08)`, now `--app-lift`.

### Added — the preview resets what it does not own

`/design-system`'s specimen unsets all eleven skin names, not just the three faces. This site
declares every one of them on `:root` now, and a custom property inherits — so "the base ships
neither a typeface nor a brand" was a claim its own page had started to contradict.

## 2026-09-17, a second page, and two palettes that are not this site's

### Added

`/design-system` — penumbra taken apart, with a switch over three layerings of one specimen: the
base alone, an eleven-declaration tint over it, and a skin that replaces the base outright.

The specimen is plain markup styled entirely through `var(--app-*)` — no MUI inside it, no literal,
no branch on the colour scheme — which is what makes the switch a demonstration rather than three
hand-drawn pictures. The same 24 base names and the same 8 brand names are all exercised by it, so a
state that fails to declare one shows the gap instead of hiding it.

**The sheets are read as text and their `:root` is rewritten to the preview's own selector.** A
token sheet says `:root` because that is where a design system lives; a preview is the one place it
is not true. Rewriting rather than keeping scoped copies is what keeps the page honest — the bytes
on screen are `penumbra/tokens.skin.base.css` and the two example skins as they sit on disk.

`src/styles/skins/tint.css` and `src/styles/skins/replaced.css` are that demonstration material and
live here rather than in the package, which ships nothing a project would inherit as a default.

**A custom property inherits, which nearly made the page lie.** This site declares its three faces
on `:root`, so the state that declares no typeface was showing them — "the base ships none" is a
claim the screen would have contradicted. The preview resets the three names to `initial` and a
skin re-declares them; colour needed no such reset, this site keeping its palette in MUI.

### Added — the palettes are measured

`yarn check` runs `penumbra-contrast` over both example skins, the second with `--no-base` since it
declares everything itself. Sixteen pairs each, both schemes.

The page's own chrome was measured in a browser with alpha composited, six configurations —
three states times two schemes — and one thing turned up that reading the source would not have:
MUI spends `rgba(0, 0, 0, 0.54)` on an unselected toggle button, which composites to **4.42:1** on
this page's ground. Under AA, on the page that argues colour should be measured.

### Changed

`/` is no longer the only route, so `App` splits: the landing page stays in the entry chunk, where
a second round trip before first paint would be paid by every visitor, and `/design-system` is
lazy. penumbra joins the two playgrounds in "What's running" — a `RouterLink`, not an anchor,
because unlike them it is a page of this application rather than its own build.

## 2026-09-16, the front door moves in

### Added

The homepage of francisdesjardins.ca, carried over from its own repository at `b07d934`: 17 files
and 1090 lines, which is the route's real closure rather than a guess at it. The page, the two
fixed-corner toggles, the MUI theme, the i18n setup and the skin.

It came out of a project of some 250 files. Tracing the import graph from `main.tsx` reached 219 of
them — because `App.tsx` named all six routes, five of which were experiments. Trimming it to the
one route that is online gave the 17.

### What came with it, and what did not

**`tokens.system.css` was a third copy of [penumbra](../../packages/penumbra).** Not a near-copy:
across 93 lines, every declaration matched. And its header said, in as many words, that the day
these siblings shared a monorepo the copies would collapse into one package. That is now the second
time that same file has made that prediction and been right. It is a dependency.

**`LocalizationProvider` and `@mui/x-date-pickers` are gone**, with `date-fns` behind them. They
were feeding date fields that exist only in the scratchpad this page was living in.

**The only page is imported, not lazily loaded.** Splitting the sole route off the entry chunk buys
a network round trip before anything paints.

**`react` moved 19.2.8 → 19.3.0**, matching the playgrounds, so the lockfile holds one React rather
than one per app.

### How any of that is known to be safe

The old build was fingerprinted before a file moved, and the fingerprint is deliberately wider than
a screenshot: the full DOM tree under `#root` with 35 computed properties on every element, every
meta tag, every hand-written head link, the JSON-LD parsed and re-serialised, in four combinations —
English and French, light and dark, desktop and phone — plus what both toggles do when clicked.

448 lines. The new build reproduces them byte for byte, and still did after the toolchain
conversion, and still did when measured from inside the deploy zip rather than from the tree that
produced it.

Emotion's class names are normalised out and the styles measured instead, because a class name is
a hash of its own contents: comparing them would fail on a rename and pass on a changed colour,
which is backwards.

### Fixed

`useDocumentHead` asserted `document.querySelector(…) as HTMLMetaElement`, twice. `querySelector`
answers `null` when the element is absent — and that is exactly the branch underneath, the one that
creates the tag. The assertion erased the `null` from the type, so the guard read as unreachable to
anything type-aware while it went on running. The type-aware lint found both the day it was pointed
at this code.

### Changed

The six `@mui/material` barrel imports became per-module ones. One barrel import puts MUI's whole
re-export graph into every compile; the playgrounds already carry the rule, and this app now runs
their `.oxlintrc.json` unchanged.
