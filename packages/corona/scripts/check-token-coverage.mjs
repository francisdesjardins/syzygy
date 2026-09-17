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

/**
 * The stacking group is printed in the order it is written, and for that one group the order is a
 * claim: a reader takes the list as bottom-to-top and reasons about which layer covers which. Every
 * other group is a reading order and editorial. So this is the one that can be wrong, and it was —
 * the mascot sat last, reading as the topmost thing on the page, while the sheet had it tied with
 * the sidebar and then moved it to the bottom.
 */
const valueOf = (name) => {
  const pattern = new RegExp(`${name}\\s*:\\s*([^;]+)`);
  return Number(pattern.exec(readFileSync(SYSTEM, 'utf8'))?.[1]?.trim() ?? NaN);
};
const stacking = [
  ...(/stacking:\s*\[([^\]]*)\]/.exec(groups)?.[1] ?? '').matchAll(/'([^']+)'/g),
].map((match) => {
  return match[1];
});
const values = stacking.map(valueOf);
const ascending = values.every((value, index) => {
  return index === 0 || value > (values[index - 1] ?? -Infinity);
});
if (!ascending) {
  failures.push(
    `The stacking group is not in ascending order, so the page prints the layers in an order the\n  sheet contradicts:\n    ${stacking.map((name, index) => `${name} = ${String(values[index])}`).join('\n    ')}`
  );
}
if (stacking.length < 4 || values.some(Number.isNaN)) {
  failures.push(
    `Read ${String(stacking.length)} stacking tokens and ${String(values.filter(Number.isNaN).length)} unreadable values. The order check is\n  matching less than the group holds, which would let a wrong order through.`
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
