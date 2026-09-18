#!/usr/bin/env node
/**
 * Every `var(--app-…)` names a token something declares.
 *
 * `check-token-coverage` in corona runs the other way: it fails on a token nothing *shows*. This
 * one fails on a name nothing *declares*, and the difference is what a browser does with each. An
 * undocumented token is invisible to a reader; an undeclared one resolves to nothing at all, so the
 * property falls back to whatever it inherits and the page renders at a browser default with
 * nothing anywhere complaining. `--app-text-4xl` shipped a heading that way — the scale stops at
 * `3xl` — and a screenshot is what caught it.
 *
 * It lives here rather than in penumbra because penumbra ships two stylesheets and knows nothing
 * about who reads them, and rather than in corona because the consumers are whole applications
 * rather than the viewer. A gate every workspace runs belongs with the gates.
 *
 *     gnomon-token-usage --declares <sheet>... -- <dir>...
 *
 * A declaring sheet is penumbra's two plus whatever skin the project writes over them. A scanned
 * directory is source: `.css`, `.ts` and `.tsx`, since an inline style is as able to name a token
 * that does not exist as a stylesheet is.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const args = process.argv.slice(2);
const split = args.indexOf('--');
const declaring = args.slice(0, split === -1 ? args.length : split).filter((arg) => {
  return arg !== '--declares';
});
const roots = split === -1 ? [] : args.slice(split + 1);

if (declaring.length === 0 || roots.length === 0) {
  console.error('usage: gnomon-token-usage --declares <sheet>... -- <dir>...');
  process.exit(2);
}

/** A declaration is `--app-name:`; a fallback inside `var()` is not one. */
const declared = new Set();
for (const sheet of declaring) {
  for (const [, name] of readFileSync(sheet, 'utf8').matchAll(/(?:^|[;{]|\s)(--app-[\w-]+)\s*:/g)) {
    declared.add(name);
  }
}

const SOURCE = new Set(['.css', '.ts', '.tsx']);

const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(path));
    } else if (SOURCE.has(extname(entry.name))) {
      out.push(path);
    }
  }
  return out;
};

const used = new Map();
let files = 0;
for (const root of roots) {
  if (!statSync(root).isDirectory()) {
    continue;
  }
  for (const path of walk(root)) {
    files += 1;
    const text = readFileSync(path, 'utf8');
    for (const [, name] of text.matchAll(/var\(\s*(--app-[\w-]+)/g)) {
      if (!used.has(name)) {
        used.set(name, path);
      }
    }
  }
}

const failures = [];

const missing = [...used.entries()].filter(([name]) => {
  return !declared.has(name);
});
if (missing.length > 0) {
  failures.push(
    `These are read and nothing declares them, so they resolve to nothing and the property falls\n  back silently:\n    ${missing
      .map(([name, path]) => {
        return `${name}  first in ${path.split('\\').join('/')}`;
      })
      .join('\n    ')}`
  );
}

/**
 * The floors. Both halves can pass trivially — a run that matched no declaration would call every
 * usage undeclared, and a run that matched no usage would call every sheet clean — so each is
 * checked for having found anything at all.
 */
if (declared.size < 20) {
  failures.push(
    `Only ${String(declared.size)} declarations read from ${String(declaring.length)} sheet(s). The parser stopped\n  matching, which would make every usage below look undeclared.`
  );
}
if (used.size < 10) {
  failures.push(
    `Only ${String(used.size)} distinct tokens read across ${String(files)} files. The usage pattern stopped\n  matching, which would make this check pass on anything.`
  );
}

if (failures.length > 0) {
  console.error('\ntoken-usage: a name is read that nothing declares.\n');
  for (const failure of failures) {
    console.error(`  ${failure}\n`);
  }
  process.exit(1);
}

console.log(
  `token-usage: ${String(used.size)} tokens read across ${String(files)} files, all declared by ${String(declaring.length)} sheet(s).`
);
