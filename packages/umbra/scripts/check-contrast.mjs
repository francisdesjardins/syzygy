// Reads the base with the skin over it and measures every pair the tokens promise, rather than
// trusting that they were chosen carefully. A palette is the one part of a design system where "it
// looks fine" and "it passes" come apart, and the failure lands on whoever has the worse screen.
//
// Run by `yarn check:contrast`, which `yarn check` calls.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const SKIN = 'playground/src/app/styles/tokens.skin.css';

// Resolved through the playground's own manifest rather than a path up the tree: penumbra is the
// playground's dependency, and reaching for it from here by relative path would work only as long
// as the two stay this far apart.
const BASE = createRequire(new URL('../playground/package.json', import.meta.url)).resolve(
  'penumbra/tokens.skin.base.css'
);

/** Text needs 4.5:1; a control edge or a large heading needs 3:1. */
const PAIRS = [
  { ink: '--app-text', on: '--app-bg', min: 4.5, what: 'body text on the page' },
  { ink: '--app-text', on: '--app-paper', min: 4.5, what: 'body text on a card' },
  { ink: '--app-text-secondary', on: '--app-paper', min: 4.5, what: 'secondary text on a card' },
  { ink: '--app-text-tertiary', on: '--app-paper', min: 4.5, what: 'tertiary text on a card' },
  { ink: '--app-accent', on: '--app-paper', min: 4.5, what: 'a link on a card' },
  { ink: '--app-accent', on: '--app-bg', min: 4.5, what: 'a link on the page' },
  { ink: '--app-primary-ink', on: '--app-primary', min: 4.5, what: 'a filled primary button' },
  { ink: '--app-primary-ink', on: '--app-primary-hover', min: 4.5, what: 'that button, hovered' },
  { ink: '--app-error-ink', on: '--app-error', min: 4.5, what: 'a filled error button' },
  { ink: '--app-ok', on: '--app-paper', min: 4.5, what: 'a success note' },
  { ink: '--app-info', on: '--app-paper', min: 4.5, what: 'an informational note' },
  { ink: '--app-error', on: '--app-paper', min: 4.5, what: 'an error note' },
  { ink: '--app-warn', on: '--app-paper', min: 4.5, what: 'a warning note' },
  { ink: '--app-control-border', on: '--app-paper', min: 3, what: 'a control edge on a card' },
  { ink: '--app-control-border', on: '--app-bg', min: 3, what: 'a control edge on the page' },
  { ink: '--app-flame', on: '--app-paper', min: 3, what: 'the ring as a mark, not as text' },
];

function parse(css, selector) {
  const block = css.slice(css.indexOf(selector) + selector.length);
  const body = block.slice(0, block.indexOf('}'));
  const values = new Map();
  for (const [, name, value] of body.matchAll(/(--app-[\w-]+)\s*:\s*([^;]+);/g)) {
    values.set(name, value.trim());
  }
  return values;
}

function toRgb(value) {
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = /^rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(value);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

function luminance([r, g, b]) {
  const channel = (value) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// Cascade order, the same one app.css declares: the base lays down the neutrals and the semantics,
// the skin writes its brand over them. Measuring the skin alone would measure a palette the browser
// never shows.
const sheets = [readFileSync(BASE, 'utf8'), readFileSync(SKIN, 'utf8')];
const cascade = (selector) => {
  const values = new Map();
  for (const sheet of sheets) {
    for (const [name, value] of parse(sheet, selector)) values.set(name, value);
  }
  return values;
};
const schemes = [
  { name: 'light', values: cascade(':root {') },
  { name: 'dark', values: cascade(":root[data-color-scheme='dark'] {") },
];

const failures = [];
for (const scheme of schemes) {
  // Dark redeclares only what changes, so anything it leaves out is light's value still standing.
  const resolve = (token) =>
    scheme.name === 'dark'
      ? (scheme.values.get(token) ?? schemes[0].values.get(token))
      : scheme.values.get(token);

  for (const pair of PAIRS) {
    const ink = toRgb(resolve(pair.ink) ?? '');
    const on = toRgb(resolve(pair.on) ?? '');
    if (ink === null || on === null) {
      failures.push(`${scheme.name}: ${pair.ink} or ${pair.on} is missing or not a plain colour`);
      continue;
    }
    const ratio = contrast(ink, on);
    if (ratio < pair.min) {
      failures.push(
        `${scheme.name}: ${pair.what} is ${ratio.toFixed(2)}:1, under the ${pair.min}:1 it owes (${pair.ink} on ${pair.on})`
      );
    }
  }
}

if (failures.length > 0) {
  console.error(`check:contrast found ${failures.length} pair(s) below their floor:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`check:contrast: ${PAIRS.length * 2} pairs measured across both schemes, all pass.`);
