#!/usr/bin/env node
/**
 * Every workspace runs the shared gates that apply to it, or says in writing why it does not.
 *
 * The gates in this repository are good and they were unevenly applied: the comment budget ran in
 * two packages of six, and the four without it had drifted — four blocks over in one, three in
 * another — with nothing to notice. A gate adopted per package is a gate that protects whoever
 * remembered it.
 *
 * So the rule is derived rather than listed. gnomon's `bin` entries **are** the set of shared gates;
 * a new one becomes required everywhere it applies on the day it is published, without an index
 * anyone has to remember to edit. Applicability is read off the workspace itself — a package with
 * TypeScript owes a comment budget, one with a `CLAUDE.md` owes a doc budget — and the one way out
 * is `gates.skip` in the manifest, which turns an omission into a sentence someone had to write.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** A report rather than a gate: it prints coverage, it refuses nothing. */
const NOT_A_GATE = new Set(['gnomon-ct-coverage-report']);

/** Every workspace with a manifest, found rather than listed. */
function workspaces() {
  const found = [];
  for (const group of ['packages', 'apps']) {
    const base = resolve(ROOT, group);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = join(base, entry.name);
      if (existsSync(join(dir, 'package.json'))) found.push(dir);
      // A playground is its own workspace and its gates are the parent's; it has no `check`.
    }
  }
  return found;
}

function walk(dir, take) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.yarn') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(path, take));
    else if (take(entry.name)) found.push(path);
  }
  return found;
}

/** Which commands a workspace's `check` reaches, following `yarn <script>` through its own scripts. */
function reached(scripts) {
  const seen = new Set();
  const pending = ['check'];
  const text = [];
  while (pending.length > 0) {
    const name = pending.pop();
    if (name === undefined || seen.has(name) || scripts[name] === undefined) continue;
    seen.add(name);
    const body = scripts[name];
    text.push(body);
    for (const match of body.matchAll(/\byarn\s+([\w:-]+)/g)) pending.push(match[1]);
  }
  return text.join(' && ');
}

/** What a workspace owes, decided from what it contains rather than from a list. */
const APPLIES = {
  'gnomon-comment-budget': (dir) => walk(dir, (name) => /\.tsx?$/.test(name)).length > 0,
  'gnomon-doc-budget': (dir) => existsSync(join(dir, 'CLAUDE.md')),
  'gnomon-examples': (dir) =>
    walk(dir, (name) => /\.tsx?$/.test(name)).some((file) =>
      /^\s*\*\s*@example\b/m.test(readFileSync(file, 'utf8'))
    ),
  'gnomon-token-usage': (dir) =>
    walk(dir, (name) => /\.(tsx?|css)$/.test(name)).some((file) =>
      readFileSync(file, 'utf8').includes('var(--app-')
    ),
};

const gnomon = JSON.parse(readFileSync(resolve(ROOT, 'packages/gnomon/package.json'), 'utf8'));
const shared = Object.keys(gnomon.bin ?? {}).filter((name) => !NOT_A_GATE.has(name));

const failures = [];
const rows = [];

for (const dir of workspaces()) {
  const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const scripts = manifest.scripts ?? {};
  if (scripts.check === undefined) continue;

  const chain = reached(scripts);
  const skip = manifest.gates?.skip ?? {};
  const runs = [];
  const skipped = [];

  for (const gate of shared) {
    const applies = APPLIES[gate];
    if (applies !== undefined && !applies(dir)) continue;
    const short = gate.replace(/^gnomon-/, '');
    if (chain.includes(gate)) {
      runs.push(short);
    } else if (typeof skip[short] === 'string' && skip[short].length > 0) {
      skipped.push(short);
    } else {
      failures.push(
        `${manifest.name}: ${short} applies here and \`check\` does not run it — run it, or say why in "gates": { "skip": { "${short}": "…" } }`
      );
    }
  }

  // The other direction: a reason nobody needs any more is a claim nobody re-reads.
  for (const short of Object.keys(skip)) {
    if (!shared.includes(`gnomon-${short}`)) {
      failures.push(`${manifest.name}: skips ${short}, which gnomon no longer publishes`);
    } else if (chain.includes(`gnomon-${short}`)) {
      failures.push(`${manifest.name}: skips ${short} and runs it too — drop the reason`);
    }
  }

  rows.push({ name: manifest.name, runs, skipped });
}

const width = Math.max(...rows.map((row) => row.name.length));
for (const row of rows) {
  const said = row.skipped.length === 0 ? '' : `   skips: ${row.skipped.join(', ')}`;
  console.log(`  ${row.name.padEnd(width)}  ${row.runs.join(', ') || '—'}${said}`);
}

if (failures.length > 0) {
  console.error(`\ncheck:gates: ${String(failures.length)} failure(s).`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `\ncheck:gates: ${String(shared.length)} shared gates, and every workspace runs the ones that apply to it or says why not.`
);
