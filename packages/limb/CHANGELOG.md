# Changelog

Kept per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), by date. No semver.

**This file is the package's memory.** The code states what holds now; why it came to hold lives
here.

## 2026-09-16, the three that had not drifted

### Added

`color-contrast`, `fuzzy-match` and `readable-syntax`, with the 35 tests that came with one of the
two copies.

This package was planned as something much larger. The phase that created it was written to absorb
"the playground shell" — the layout, the navigation, the chrome both demos share — and sized at 28
files. Measuring first is what shrank it to three.

The shell is not shared. `RootLayout`, the sidebar, the top bar and the navigation all diverge,
**and should**: the two playgrounds demonstrate different libraries and therefore hold different
pages. The API reference route looked shareable at 943 lines until its dependencies were traced —
it needs five components, and four of them differ by design rather than by neglect. `CodeBlock`
diverges on 117 of 129 lines; the icon set on 183. Those are two products, not one product copied
badly.

What was genuinely shared was smaller and of one kind.

### The finding that drew the boundary

Seven modules sat at `shared/lib` on both sides. Split by whether they import anything at run time,
they split perfectly:

| | modules | divergence |
| --- | --- | --- |
| no run-time import | 3 | **0 lines** |
| imports React | 4 | 11–38 lines |

Byte-identical against drifted, with nothing in between. Two copies of a pure function stay equal
because there is only one right answer and both authors found it; two copies of a hook drift because
each one bends toward the app around it.

That is why the package takes framework-freedom as its rule rather than its description. It is the
property that made these three shareable, and the absence of it is what made the other four not.

### Not taken, deliberately

`useDocumentTitle` diverges by exactly one line — a product-name constant — and is the most tempting
file in either playground. It is a hook. Taking it would spend the rule above on 52 lines and put
React in a package whose whole claim is that it does not need one.

`fonts.css` is three `@font-face` blocks. It belongs to a design system, and this one —
[penumbra](../penumbra) — refuses typefaces by an invariant of its own.

`react-syntax-highlighter-subpaths.d.ts` is ambient, so it has to sit inside each consumer's
`include` to do anything. Sharing it would mean each consumer reaching across a package boundary to
find it, which costs more than the 53 duplicated lines it saves.
