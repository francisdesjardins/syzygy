#!/usr/bin/env node
/**
 * The palette, measured rather than trusted.
 *
 * A palette is the one part of a design system where "it looks fine" and "it passes" come apart,
 * and the difference lands on whoever has the worse screen. Reading the sheet is not enough: a
 * ratio is arithmetic on two resolved values, and the values that matter are the ones left after
 * the cascade, not the ones any single file declares.
 *
 * The pairs live here because the *names* do. `--app-primary-ink on --app-primary` owes 4.5:1
 * because of what those two names mean, which is penumbra's vocabulary — a consumer that kept its
 * own copy of this table would be maintaining a definition it does not own.
 *
 *     penumbra-contrast <skin.css>...          the base, then each sheet over it
 *     penumbra-contrast --no-base <skin.css>   a project that replaced the base outright
 *     penumbra-contrast                        the base alone; only its own pairs are measurable
 *
 * Sheets are layered left to right, so the last one wins a name the earlier ones also declare.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'tokens.skin.base.css');

/**
 * Pairs whose two tokens are both the base's. They hold whatever a project writes over them, so
 * they are measured on every run.
 */
const BASE_PAIRS = [
  { ink: '--app-text', on: '--app-bg', min: 4.5, what: 'body text on the page' },
  { ink: '--app-text', on: '--app-paper', min: 4.5, what: 'body text on a card' },
  { ink: '--app-text-secondary', on: '--app-paper', min: 4.5, what: 'secondary text on a card' },
  { ink: '--app-text-tertiary', on: '--app-paper', min: 4.5, what: 'tertiary text on a card' },
  { ink: '--app-error-ink', on: '--app-error', min: 4.5, what: 'a filled error button' },
  { ink: '--app-error', on: '--app-paper', min: 4.5, what: 'an error note' },
  { ink: '--app-ok', on: '--app-paper', min: 4.5, what: 'a success note' },
  { ink: '--app-info', on: '--app-paper', min: 4.5, what: 'an informational note' },
  { ink: '--app-warn', on: '--app-paper', min: 4.5, what: 'a warning note' },
  { ink: '--app-control-border', on: '--app-paper', min: 3, what: 'a control edge on a card' },
  { ink: '--app-control-border', on: '--app-bg', min: 3, what: 'a control edge on the page' },
];

/** Pairs that need a brand token, so they only exist once a skin has been written. */
const SKIN_PAIRS = [
  { ink: '--app-accent', on: '--app-paper', min: 4.5, what: 'a link on a card' },
  { ink: '--app-accent', on: '--app-bg', min: 4.5, what: 'a link on the page' },
  { ink: '--app-primary-ink', on: '--app-primary', min: 4.5, what: 'a filled primary button' },
  { ink: '--app-primary-ink', on: '--app-primary-hover', min: 4.5, what: 'that button, hovered' },
  { ink: '--app-flame', on: '--app-paper', min: 3, what: 'the fill as a mark, not as text' },
];

const parse = (css, selector) => {
  const start = css.indexOf(selector);
  const values = new Map();
  if (start === -1) {
    return values;
  }
  const block = css.slice(start + selector.length);
  for (const [, name, value] of block
    .slice(0, block.indexOf('}'))
    .matchAll(/(--app-[\w-]+)\s*:\s*([^;]+);/g)) {
    values.set(name, value.trim());
  }
  return values;
};

const toRgb = (value) => {
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = /^rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(value);
  return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : null;
};

const luminance = ([r, g, b]) => {
  const channel = (value) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => {
    return y - x;
  });
  return (light + 0.05) / (dark + 0.05);
};

const args = process.argv.slice(2);
const withoutBase = args.includes('--no-base');
const skins = args.filter((arg) => {
  return arg !== '--no-base';
});
const sheets = [...(withoutBase ? [] : [BASE]), ...skins].map((path) => {
  return readFileSync(path, 'utf8');
});

if (sheets.length === 0) {
  console.error('penumbra-contrast: --no-base with no sheet leaves nothing to measure.');
  process.exit(1);
}

const cascade = (selector) => {
  const values = new Map();
  for (const sheet of sheets) {
    for (const [name, value] of parse(sheet, selector)) {
      values.set(name, value);
    }
  }
  return values;
};

const schemes = [
  { name: 'light', values: cascade(':root {') },
  { name: 'dark', values: cascade(":root[data-color-scheme='dark'] {") },
];

/**
 * A run with no skin has no brand to measure, and saying so is the point — silently dropping the
 * five pairs would make an unskinned run look like a full one.
 */
const pairs = skins.length === 0 ? BASE_PAIRS : [...BASE_PAIRS, ...SKIN_PAIRS];

const failures = [];
for (const scheme of schemes) {
  // Dark redeclares only what changes, so anything it leaves out is light's value still standing.
  const resolveToken = (token) => {
    return scheme.name === 'dark'
      ? (scheme.values.get(token) ?? schemes[0].values.get(token))
      : scheme.values.get(token);
  };

  for (const pair of pairs) {
    const ink = toRgb(resolveToken(pair.ink) ?? '');
    const on = toRgb(resolveToken(pair.on) ?? '');
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

const what =
  skins.length === 0 ? 'the base alone, brand pairs not applicable' : skins.join(' over ');
if (failures.length > 0) {
  console.error(`penumbra-contrast (${what}) found ${failures.length} pair(s) below their floor:`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `penumbra-contrast: ${String(pairs.length * 2)} pairs measured across both schemes — ${what}.`
);
