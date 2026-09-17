#!/usr/bin/env node
/**
 * Every system token is on a page somebody can read.
 *
 * `SYSTEM_GROUPS` decides which family a token belongs to, and that is editorial — a reader wants
 * leading beside the ramp, not beside the line heights the sheet happens to declare next to. What
 * is not editorial is whether a token appears at all: one that no group claims is invisible on
 * every design-system page in the repository, and nothing else would say so.
 *
 * The rule runs here rather than in penumbra because it is the *viewer* that owes it. penumbra
 * ships two stylesheets and knows nothing about who renders them; a gate there would make the
 * package answerable for a consumer's table of contents.
 *
 * The skin half is deliberately not checked. Colour is the part a project rewrites, so which
 * colours a page shows is that project's decision and each playground passes its own list.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const SYSTEM = createRequire(import.meta.url).resolve('penumbra/tokens.system.css');

const declared = new Set(
  [
    ...readFileSync(SYSTEM, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .matchAll(/(--app-[\w-]+)\s*:/g),
  ].map((match) => {
    return match[1];
  })
);

/**
 * Read as text rather than imported: this file is TypeScript with `.ts` specifiers, and standing a
 * compiler up to answer one question about a list of strings buys nothing the regex does not.
 */
const source = readFileSync(
  new URL('../src/tokens/contract.ts', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
  'utf8'
);
const groups = /SYSTEM_GROUPS = \{([\s\S]*?)\n\} as const/.exec(source)?.[1] ?? '';

const filed = new Map();
for (const [, name] of groups.matchAll(/'(--app-[\w-]+)'/g)) {
  filed.set(name, (filed.get(name) ?? 0) + 1);
}
// `--app-space-N` is built from a list of numbers rather than written out, so it is expanded here
// the same way the module does it.
for (const [, list] of groups.matchAll(/space:\s*\[([\d,\s]*)\]/g)) {
  for (const step of list.split(',')) {
    const name = `--app-space-${step.trim()}`;
    if (step.trim() !== '') {
      filed.set(name, (filed.get(name) ?? 0) + 1);
    }
  }
}

const failures = [];

const missing = [...declared].filter((name) => {
  return !filed.has(name);
});
if (missing.length > 0) {
  failures.push(
    `These are declared in tokens.system.css and appear on no page:\n    ${missing.join('\n    ')}`
  );
}

const unknown = [...filed.keys()].filter((name) => {
  return !declared.has(name);
});
if (unknown.length > 0) {
  failures.push(
    `These are in SYSTEM_GROUPS and the sheet no longer declares them:\n    ${unknown.join('\n    ')}`
  );
}

const twice = [...filed.entries()]
  .filter(([, count]) => {
    return count > 1;
  })
  .map(([name]) => {
    return name;
  });
if (twice.length > 0) {
  failures.push(
    `These are in two groups, so a reader meets them twice and neither page owns them:\n    ${twice.join('\n    ')}`
  );
}

if (failures.length > 0) {
  console.error('\ncorona: the system half and its table of contents disagree.\n');
  for (const failure of failures) {
    console.error(`  ${failure}\n`);
  }
  process.exit(1);
}

console.log(
  `check:tokens: all ${String(declared.size)} system tokens are filed, each in exactly one group.`
);
