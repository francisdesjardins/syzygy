/**
 * The split, as a gate — and it runs in both directions.
 *
 * `tokens.system.css` is the half that ports into another project unchanged. The moment a colour
 * or a typeface appears in it that stops being true: the file becomes one project's, and the next
 * either rewrites it or inherits a palette it never chose.
 *
 * `tokens.skin.base.css` is the other half of that bargain, and it owes the opposite promise. It
 * carries colour, so the only thing worth checking is that it carries **nothing a project would
 * recognise as its own** — no typeface, and no token the system file already declares. A brand hue
 * landing here is the same failure as a colour landing there, arriving from the other side.
 *
 * The rules belong to the package that owns the files. Enforced from inside a consumer, they guard
 * that consumer and leave every other one unguarded.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Comments are prose and may name any colour they like; only declarations are the contract. */
const declarationsOf = (name) => {
  return readFileSync(join(root, name), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line, index) => ({ line: line.trim(), number: index + 1, file: name }))
    .filter(({ line }) => line.includes(':') && line.includes('--app-'));
};

const system = declarationsOf('tokens.system.css');
const base = declarationsOf('tokens.skin.base.css');

/** @type {string[]} */
const failures = [];

const refuse = (offenders, why) => {
  if (offenders.length > 0) {
    const where = offenders.map((o) => `    ${o.file}:${o.number}  ${o.line}`).join('\n');
    failures.push(`${why}\n${where}`);
  }
};

const COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\blab\(|\bcolor-mix\(/;
const TYPEFACE = /font-family|--app-font-/;
const nameOf = (line) => {
  return /(--app-[a-z0-9-]+)\s*:/.exec(line)?.[1] ?? '';
};

// ── The system half refuses colour ───────────────────────────────────────────
refuse(
  system.filter(({ line }) => {
    return COLOUR.test(line);
  }),
  'A colour here means the system half has stopped being portable. It belongs in\n  tokens.skin.base.css when every project would agree on it, and in the consuming project’s own\n  tokens.skin.css when it is a brand.'
);

refuse(
  system.filter(({ line }) => {
    return TYPEFACE.test(line);
  }),
  'A typeface is skin, not system, and it is not base either: a project that ships font files and\n  one that uses system stacks choose differently and both are right.'
);

// ── The base skin refuses a brand ────────────────────────────────────────────
refuse(
  base.filter(({ line }) => {
    return TYPEFACE.test(line);
  }),
  'A typeface in the base makes it a default nobody chose. It belongs in the consuming project’s\n  tokens.skin.css.'
);

/**
 * The eight names a project paints itself with. Listing them is cruder than a hue test and that is
 * the point: `#b91c1c` is a brand red or a semantic error depending only on which name it is bound
 * to, so the name is the thing worth checking.
 */
const BRAND = /^--app-(primary|accent|flame|ring|glow)\b/;
refuse(
  base.filter(({ line }) => {
    return BRAND.test(nameOf(line));
  }),
  'This name is where a project puts its own colour, so a value here would be a brand nobody chose.\n  It belongs in the consuming project’s tokens.skin.css.'
);

const systemNames = new Set(
  system.map(({ line }) => {
    return nameOf(line);
  })
);
refuse(
  base.filter(({ line }) => {
    return systemNames.has(nameOf(line));
  }),
  'This token is already declared by the system half. Two files answering for one name means the\n  winner is import order rather than intent.'
);

/**
 * The stacking scale, where a tie is the failure.
 *
 * Two `--app-z-*` tokens on the same number do not order anything: whichever element the document
 * renders last wins, so the layer a reader sees is decided by a JSX line nobody thought of as a
 * z-index. It cost the mascot and the drawer's backdrop exactly that — the mascot rendered last,
 * landed above the backdrop, and ate the tap that closes the drawer on a phone.
 */
const stacking = system.filter(({ line }) => {
  return nameOf(line).startsWith('--app-z-');
});
const byValue = new Map();
for (const declaration of stacking) {
  const value = /:\s*([^;]+)/.exec(declaration.line)?.[1]?.trim() ?? '';
  byValue.set(value, [...(byValue.get(value) ?? []), declaration]);
}
refuse(
  [...byValue.values()]
    .filter((group) => {
      return group.length > 1;
    })
    .flat(),
  'Two stacking tokens share a value, so document order decides which paints on top. Give each\n  layer its own number, in the order a reader should see them.'
);
if (stacking.length < 4) {
  failures.push(
    `Only ${String(stacking.length)} --app-z-* tokens found. The stacking check is matching less\n  than the scale holds, which would let a tie through.`
  );
}

/**
 * An empty file passes every rule above, which would make this check a comfort rather than a gate.
 * The numbers are floors to catch truncation, not specs — raise one if it ever gets in the way.
 */
if (system.length < 20) {
  failures.push(
    `Only ${String(system.length)} system token declarations found. The sheet is far smaller than it\n  should be — truncated, or the parser stopped matching.`
  );
}
if (base.length < 20) {
  failures.push(
    `Only ${String(base.length)} base skin declarations found. The sheet is far smaller than it\n  should be — truncated, or the parser stopped matching.`
  );
}

if (failures.length > 0) {
  console.error(`\npenumbra: the system/skin split is broken.\n`);
  for (const failure of failures) {
    console.error(`  ${failure}\n`);
  }
  process.exit(1);
}

console.log(
  `penumbra: ${String(system.length)} system tokens with no colour and no typeface, ` +
    `${String(base.length)} base skin tokens with no brand and no typeface.`
);
