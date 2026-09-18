#!/usr/bin/env node
/**
 * No colour in the TypeScript.
 *
 * This site's palette is `src/styles/tokens.skin.css` over penumbra's two sheets, and nothing else.
 * A hexadecimal in a component is a second palette starting: it renders correctly the day it is
 * written, ignores the colour scheme, and is invisible to `yarn check:contrast`, which measures the
 * tokens.
 *
 * Stylesheets are exempt by definition — they are where colour is declared.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'src';
const COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\blab\(/;

/** The one value that is not a palette: a fallback loud enough to be read as the bug it reports. */
const SENTINEL = '#ff00ff';

const walk = (dir) => {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(path);
    }
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
};

const offenders = [];
for (const path of walk(ROOT)) {
  for (const [index, line] of readFileSync(path, 'utf8').split('\n').entries()) {
    // Prose may name any colour it likes; only code is the contract.
    const code = line.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '');
    if (COLOUR.test(code) && !code.includes(SENTINEL)) {
      offenders.push(`  ${relative('.', path)}:${String(index + 1)}  ${line.trim()}`);
    }
  }
}

if (offenders.length > 0) {
  console.error('\nhome: colour belongs in the token sheets, not in a component.\n');
  console.error(offenders.join('\n'));
  console.error('');
  process.exit(1);
}

console.log('check:literals: no colour outside the token sheets.');
