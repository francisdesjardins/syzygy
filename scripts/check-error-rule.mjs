#!/usr/bin/env node
/**
 * umbra and antumbra answer "what is a non-`Error` throw called" with the same text.
 *
 * Both packages catch `unknown` and have to name it: antumbra to build the `Error` an action
 * reports, umbra to fill the `SerializedError` its timeline ships. One question, and for a while
 * two answers — antumbra coerced with `String(value)`, which says `[object Object]` for a plain
 * object and **throws**, inside an error path, for a null-prototype object or a failing
 * `toString`.
 *
 * Neither can import the other's copy: both publish `dependencies: {}`, and a shared module would
 * cost the zero-dependency promise that is on each README. So the rule is shared by being the same
 * text in two files, and this is what says so.
 *
 * Byte-identical rather than merely equivalent, because "equivalent" is a judgement a diff cannot
 * make and a reader would have to re-derive. It is the same measure `limb` used to decide what
 * could collapse into one package at all.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Every copy of the rule. A third package that has to name a throw adds its path here. */
const COPIES = [
  'packages/antumbra/src/utils/thrown-message.ts',
  'packages/umbra/src/utils/thrown-message.ts',
];

const read = (relative) => {
  try {
    return readFileSync(join(root, relative), 'utf8');
  } catch {
    console.error(`check:error-rule: ${relative} is missing.`);
    console.error('Every package that names a non-Error throw carries the rule; none may drop it.');
    process.exit(1);
  }
};

const [first, ...rest] = COPIES;
const reference = read(first);

for (const copy of rest) {
  const text = read(copy);
  if (text === reference) {
    continue;
  }

  const referenceLines = reference.split('\n');
  const lines = text.split('\n');
  const at = lines.findIndex((line, index) => {
    return line !== referenceLines[index];
  });

  console.error(`check:error-rule: ${copy} has drifted from ${first}.`);
  console.error(`  first difference at line ${String(at + 1)}:`);
  console.error(`    ${first}: ${referenceLines[at] ?? '(end of file)'}`);
  console.error(`    ${copy}: ${lines[at] ?? '(end of file)'}`);
  console.error('');
  console.error('The two are one rule in two files because neither package may depend on the');
  console.error('other. Change both, or change neither.');
  process.exit(1);
}

console.log(
  `check:error-rule: ${String(COPIES.length)} copies of the non-Error throw rule, byte-identical.`
);
