# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the app's memory.** The code states what holds now; why it came to hold lives here.

## 2026-09-19, three i18n packages for twenty-one strings

### Removed — `i18next`, `react-i18next`, `i18next-browser-languagedetector`

Two languages, twenty-one strings, one page, and — once the dead ones went — no message format in
any of them. What the libraries carry that this page does not use: plurals, interpolation,
namespaces, lazy bundles, a fallback chain.

They also cost 160 lines of local code, of which the worst was an **82-line** helper that existed
only because `i18next` initialises asynchronously: the language switch had to hand a promise to a
click handler, and `changeLanguage` had to listen for an `initialized` event in case the switch was
used before init finished. Nothing in `src/i18n/index.tsx` is asynchronous, so none of that is
there.

**55.9 KB** off the entry chunk, raw. With the router, the whole application chunk went from
109,615 bytes to 13,586.

### Fixed — `<html lang>` had three values for two languages

`index.html` declares `en-CA`, an effect in `App` wrote `i18n.language` (`en`), and the switch wrote
`en-CA`/`fr-CA`. So the attribute read `en` after a load and `fr-CA` after a toggle, for the same
page in the same language — and `useLanguage` kept its own `localStorage` copy beside the language
detector's. One owner now: `en-CA` then `fr-CA`, measured across a load, a toggle and a reload.

### Changed — a key that does not exist no longer compiles

`t` took a `string`, so `t('home.nmae')` compiled and rendered the key onto the page. Its argument is
now the union of the dotted paths in the English bundle, and the French bundle is `satisfies
typeof en`, so a key that drifts between the two fails the same way. Verified by introducing a typo:
TS2345, with the twenty-one valid keys listed.

## 2026-09-19, no router, and no blank page under a 200

### Removed — `react-router-dom`

A `BrowserRouter` around a single `<Route path="/">`, for an application with one page. The three
playgrounds are separate builds served from `/playground/`; nothing here has ever routed to them.

**38.6 KB** off the entry chunk, raw — 108,165 bytes to 69,510.

### Fixed — every path but `/` rendered nothing

`public/_redirects` ends `/* /index.html 200`, so the host hands this document to every request it
cannot serve a file for. The router then matched no route and rendered an empty body: a blank white
page, under a status code saying it was fine. A stale link, a typo, or a crawler following either
got that. Measured against arbitrary paths this site has never had — zero characters rendered.

Without the router there is nothing to match and nothing to fail to match: the page renders. That
is not a 404, and a real one would need the host to answer differently; it is the difference
between landing somewhere and landing on nothing.

## 2026-09-19, fifteen strings from a site that no longer exists

### Removed — dead translations, in both languages

Of thirty-six strings, twenty-one were used. The rest were shipped to production twice over, once
per language:

- `errorBoundary.*` — four strings for a boundary this application does not have.
- `eventStatus.*` — four more, "Allowed" and "Not Allowed", from a playground that is not here.
- `seo.playground.*` and `seo.formPlayground.*` — heads for two pages that do not exist, one of
  them describing a "FormComponents system".
- `title`, `otherTitle` and `patate.magie` — `"hello"`, `"goodbye goodbye"` and `"bleg"`.

Nothing referenced any of them; the only `title` in the source is a CSS class. `eventStatus.namespace`
was also the file's only `{{interpolation}}`, so what remains is twenty-one plain strings with no
message format in them at all.

## 2026-09-18, two things that were sections and are not

### Changed — the location is a byline

"Based in Quebec" was an `<h2>` and a `<section>` with an `aria-labelledby` pointing at it: a
heading rank, and a landmark, for three words. It also left a lone heading at the foot of the left
column once the projects beside it became cards and that column grew taller.

It sits under the lede now, at the rank a byline has. The page keeps two `<h2>`s, which is what it
has two of.

### Changed — the development note is attached to what it is about

`... still under active development` sat at the foot of the card, right-aligned, the last thing
anyone read. There it reads as a disclaimer on the whole page and on the person at the top of it.
It is about the three projects, so it is under the three projects.

## 2026-09-18, the three projects are the card the playgrounds are made of

### Changed — the page's one action looks like one

`umbra`, `penumbra` and `antumbra` were three words in a paragraph. They are the only thing this
page asks anyone to do, and a five-letter word in mono was the entire target — under WCAG 2.2's
24x24 (2.5.8) in width for two of the three.

Each is a `SurfaceCard` now, corona's, the same surface every page of those three playgrounds is
built from. This is the door to them; it should not be the one surface on the site that looks like
something else.

The link stretches over its whole card through a pseudo-element rather than sitting on the name, so
the target is 390x182 instead of a word, and the card's own hover lift is what answers the pointer.
The text stays selectable: the element that covers the card paints nothing.

### Changed — `SurfaceCard` moved out of `corona/shell`

It is not chrome, and `shell`'s barrel reaches `AppShell`, `TopBar` and `Sidebar`, all of which
import the router. A one-page site that wants a card should not have to install a router to get one,
so the card has its own area — `corona/surface` — and corona's router peer is now marked optional,
which it always was for everything outside `shell` and `api`.

## 2026-09-18, the name is set in the face the rest of the site uses

### Fixed — the front door was the one page with no typography of its own

`--app-font-display` read `'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif` and
this app shipped no font at all. So the site's own name — the first thing anyone reads here —
rendered in whatever the visitor happened to have: Iowan on a Mac, Palatino Linotype on a Windows
machine with Office, Georgia on everything else. Three different first impressions, none of them
chosen, and none of them the face the three playgrounds behind this page have self-hosted all along.

Newsreader, Geist and Geist Mono now ship from this origin too, byte-identical with the
playgrounds', preloaded so they arrive before first paint rather than re-laying out every block
under the name. The old stack stays behind each one as the fallback, so a failed download lands on
the rendering the page had before instead of on a browser default.

## 2026-09-17, the site drops MUI

### Removed

`@mui/material`, `@mui/icons-material` and the two emotion packages. **134 kB of component library
for ten primitives** — `Box`, `Stack`, `Typography`, `Link`, `Divider`, `IconButton`, `CssBaseline`
and `styled` — every one of which is a styled `div` on tokens this site already had.

The theme was the giveaway: `useTheme` resolved `--app-primary` out of the document and handed it
back as `palette.primary.main`, so the conversion is a substitution rather than a redesign. The hook
is 63 lines where it was 164, and nothing reads a token in JavaScript any more — the stylesheets do
it, which is what a custom property is for.

What replaces it: one `app.css` for the reset and the element defaults, one `IconButton` of twenty
lines, three inline glyphs, and a CSS module per surface.

**Two things the conversion is not.** Secondary text is 15px rather than MUI's 14: it asks the scale
for a step now, and the scale has no 14. And the theme attribute used to be written from inside the
MUI theme builder — a place nobody would look for it — so deleting the builder shipped a site stuck
in light mode until a screenshot caught it. It is written at module scope now, before React's first
render, which is where it belongs.

The bundle: 450 kB of JavaScript to 321.

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
