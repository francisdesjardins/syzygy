#!/usr/bin/env node
/**
 * Every `.c8rc.json` agrees about everything except what its package can reach.
 *
 * Four workspaces measure coverage and four files say how. Three of the four keys are the same
 * answer for all of them — report in the same formats, into the same directory, over every file
 * rather than only the imported ones — and `all: true` is the load-bearing one: without it a module
 * no test imports is absent from the report instead of being 0%, which reads as covered.
 *
 * `exclude` is deliberately **not** checked. It is each package's statement of what its project can
 * reach, and holding four of them to one list would make it a shared fiction rather than four true
 * sentences. That distinction is why this compares keys instead of files.
 *
 * c8 has no `extends`, so the files cannot inherit; they agree by being checked.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Every workspace that measures coverage. One that starts measuring adds its path here. */
const CONFIGS = [
  'packages/antumbra/.c8rc.json',
  'packages/umbra/.c8rc.json',
  'packages/limb/.c8rc.json',
  'packages/corona/.c8rc.json',
];

/** The keys that are one answer for the whole repository. */
const SHARED = ['all', 'reporter', 'reportsDir'];

const read = (relative) => {
  try {
    return JSON.parse(readFileSync(join(root, relative), 'utf8'));
  } catch (error) {
    console.error(`check:coverage-config: cannot read ${relative} — ${String(error)}`);
    process.exit(1);
  }
};

const [first, ...rest] = CONFIGS;
const reference = read(first);
const failures = [];

for (const key of SHARED) {
  if (reference[key] === undefined) {
    failures.push(`${first} declares no \`${key}\`, and it is one of the shared keys.`);
  }
}

for (const path of rest) {
  const config = read(path);
  for (const key of SHARED) {
    const mine = JSON.stringify(config[key]);
    const theirs = JSON.stringify(reference[key]);
    if (mine !== theirs) {
      failures.push(
        `${path} sets \`${key}\` to ${mine ?? 'nothing'}, and ${first} sets it to ${theirs}.`
      );
    }
  }
}

if (failures.length > 0) {
  console.error('\ncheck:coverage-config: the coverage configs disagree about a shared key.\n');
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  console.error('\n  Change them together, or move the key out of SHARED with the reason.\n');
  process.exit(1);
}

console.log(
  `check:coverage-config: ${String(CONFIGS.length)} coverage configs, ${String(SHARED.length)} shared keys, all agreeing.`
);
