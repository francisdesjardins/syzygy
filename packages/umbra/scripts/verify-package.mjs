// Checks the built artefact rather than the source, because everything it asserts is something the
// build could get wrong on its own: a missing entry, a declaration whose import has no extension,
// a dependency that slipped into a package that claims to have none.
//
// Run by `yarn verify:package`, which `yarn verify:all` calls.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist/esm';
const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// 1. The entries named in `exports` are the entries that exist.
const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
for (const [subpath, entry] of Object.entries(manifest.exports)) {
  for (const target of new Set(Object.values(entry))) {
    const file = target.replace(/^\.\//, '');
    if (!existsSync(file)) fail(`exports["${subpath}"] points at ${file}, which was not built.`);
  }
}

if (!existsSync(DIST)) {
  console.error(`${DIST} does not exist. Run \`yarn build\` first.`);
  process.exit(1);
}

const files = walk(DIST);
// Both quote styles. The source is single-quoted by oxfmt and the bundler emits double, so a
// pattern that knew only one matched nothing in `dist` and every check below passed vacuously —
// which is what the `mustReach` assertions exist to catch, and did.
const importPattern = /from\s+["']([^"']+)["']/g;

// Comments first: `tsc` copies JSDoc into the declarations, so a public `@example` showing how to
// import this package reads here as the package importing itself. A library whose examples cannot
// name it is the wrong trade.
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'`])\/\/[^\n]*/g, '$1');
}

const PEERS = ['react', 'react-dom', 'react/jsx-runtime', 'solid-js'];
function isPeer(specifier) {
  return PEERS.includes(specifier) || specifier.startsWith('solid-js/');
}

// Which framework each entry is allowed to reach. The root's empty list is the promise the whole
// package is built on; the positive lists are what stop that assertion from passing on a walker
// that resolved nothing.
const ENTRY_RULES = [
  { entry: 'index.js', allowed: [], mustReach: [] },
  { entry: 'react.js', allowed: ['react', 'react-dom', 'react/jsx-runtime'], mustReach: ['react'] },
  { entry: 'solid.js', allowed: ['solid-js'], mustReach: ['solid-js'] },
  { entry: 'plain.js', allowed: [], mustReach: [] },
];

function graphOf(entryFile) {
  const files = new Set();
  const packages = new Set();
  const queue = [join(DIST, entryFile)];
  while (queue.length > 0) {
    const file = queue.pop();
    if (files.has(file) || !existsSync(file)) continue;
    files.add(file);
    for (const [, specifier] of code(readFileSync(file, 'utf8')).matchAll(importPattern)) {
      if (specifier.startsWith('.')) queue.push(join(file, '..', specifier));
      else packages.add(specifier.startsWith('solid-js/') ? 'solid-js' : specifier);
    }
  }
  return { files, packages };
}

for (const file of files) {
  const source = code(readFileSync(file, 'utf8'));
  for (const [, specifier] of source.matchAll(importPattern)) {
    // 2. A relative import without an extension is invalid under node16/nodenext resolution, and
    //    `skipLibCheck` hides it in every consumer until one turns it off.
    if (specifier.startsWith('.') && !/\.[cm]?js$/.test(specifier)) {
      fail(`${relative('.', file)} imports "${specifier}" with no .js extension.`);
    }
    // 3. The only packages allowed in the output are the optional peers, and only the bindings may
    //    reach them. Anything else got in by accident.
    if (!specifier.startsWith('.') && !specifier.startsWith('node:') && !isPeer(specifier)) {
      fail(`${relative('.', file)} imports the package "${specifier}", which is not a peer.`);
    }
  }
}

// 4. Each entry reaches its own framework and nobody else's, and the root reaches no binding.
for (const rule of ENTRY_RULES) {
  const { files: reached, packages } = graphOf(rule.entry);
  for (const pkg of packages) {
    if (!rule.allowed.includes(pkg)) {
      fail(`${rule.entry} reaches "${pkg}", which belongs to another binding.`);
    }
  }
  for (const pkg of rule.mustReach) {
    if (!packages.has(pkg)) {
      fail(`${rule.entry} does not reach "${pkg}" at all, so the check above proves nothing.`);
    }
  }
  if (rule.entry !== 'index.js') continue;
  for (const file of reached) {
    const folder = relative(DIST, file).split(/[\\/]/)[0];
    if (['react', 'solid', 'plain'].includes(folder)) {
      fail(`The root entry reaches ${relative('.', file)}, which belongs to a binding.`);
    }
  }
}

if (failures.length > 0) {
  console.error(`verify:package found ${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`verify:package: ${files.length} built files, all checks passed.`);
