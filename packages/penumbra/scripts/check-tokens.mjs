/**
 * The split, as a gate.
 *
 * `tokens.system.css` is the half that ports into another project unchanged. The moment a colour
 * or a typeface appears in it that stops being true: the file becomes one project's, and the next
 * either rewrites it or inherits a palette it never chose.
 *
 * The rule belongs to the package that owns the file. Enforced from inside a consumer, it guards
 * that consumer and leaves every other one unguarded.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'tokens.system.css');
const source = readFileSync(file, 'utf8');

/** Comments are prose and may name any colour they like; only declarations are the contract. */
const declarations = source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .map((line, index) => ({ line: line.trim(), number: index + 1 }))
  .filter(({ line }) => line.includes(':') && line.includes('--app-'));

/** @type {string[]} */
const failures = [];

const refuse = (offenders, why) => {
  if (offenders.length > 0) {
    failures.push(`${why}\n${offenders.map((o) => `    tokens.system.css:${o.number}  ${o.line}`).join('\n')}`);
  }
};

refuse(
  declarations.filter(({ line }) => {
    return /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\blab\(|\bcolor-mix\(/.test(line);
  }),
  'A colour here means the system half has stopped being portable. It belongs in the consuming\n  project’s tokens.skin.css, which is the file a project is meant to rewrite.'
);

refuse(
  declarations.filter(({ line }) => /font-family|--app-font-/.test(line)),
  'A typeface is skin, not system. Same reason, same destination.'
);

/**
 * An empty file passes every rule above, which would make this check a comfort rather than a gate.
 * The number is a floor to catch truncation, not a spec — raise it if it ever gets in the way.
 */
if (declarations.length < 20) {
  failures.push(
    `Only ${String(declarations.length)} token declarations found. The sheet is far smaller than it\n  should be — truncated, or the parser stopped matching.`
  );
}

if (failures.length > 0) {
  console.error(`\npenumbra: the system/skin split is broken.\n`);
  for (const failure of failures) {
    console.error(`  ${failure}\n`);
  }
  process.exit(1);
}

console.log(`penumbra: ${String(declarations.length)} system tokens, no colour and no typeface among them.`);
