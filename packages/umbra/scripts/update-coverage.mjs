#!/usr/bin/env node
// The coverage pair, measured and written down in one move: the rule is "re-measure both or
// neither", and holding it by hand is how a README ends up quoting two numbers from two different
// days. The replacements below are anchored on the surrounding prose and must match exactly once
// each, so a reworded paragraph fails loudly instead of leaving a stale number. The write goes
// through the formatter, which owns this repository's markdown layout.
//
// Only README.md, unlike antumbra's: this repo's CLAUDE.md carries no coverage copy to keep in sync.
//
// Usage: `yarn coverage:update` — run both coverage commands and rewrite README.md.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatAs } from 'gnomon/oxfmt';

const ROOT = resolve(import.meta.dirname, '..');

// The vendored release, not `yarn` on PATH: the global one here is the classic 1.22 and would not
// know these scripts. The version comes from `packageManager`, so an upgrade needs no edit here.
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const version = pkg.packageManager?.match(/^yarn@([^+\s]+)/)?.[1];
if (!version) {
  console.error('coverage: package.json has no `packageManager` pin to locate Yarn with');
  process.exit(1);
}
const YARN = resolve(ROOT, '.yarn', 'releases', `yarn-${version}.cjs`);

/** Run a yarn script and hand back everything it printed. */
const run = (script) => {
  console.log(`coverage: running ${script} …`);
  return execSync(`"${process.execPath}" "${YARN}" ${script}`, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });
};

const unitOut = run('test:unit:coverage');
const componentOut = run('test:component:coverage');

// c8's text summary: `Statements   : 97.34% ( 2238/2299 )`
const unitMatch = unitOut.match(/Statements\s*:\s*([\d.]+)%/);
if (!unitMatch) {
  console.error('coverage: could not find the unit Statements line in c8 output');
  process.exit(1);
}
const unit = unitMatch[1];

// ct-coverage-report prints a per-file table then the same summary shape.
const componentMatch = componentOut.match(/Statements\s*:\s*([\d.]+)%/);
if (!componentMatch) {
  console.error('coverage: could not find the component Statements line — see the three failure');
  console.error('modes ct-coverage-report.mjs prints when it finds nothing.');
  process.exit(1);
}
const component = componentMatch[1];
const fileCount = (componentOut.match(/\s\ssrc\//g) ?? []).length;
if (fileCount === 0) {
  console.error('coverage: the component report listed no files');
  process.exit(1);
}

// Local, not `toISOString()`: that one is UTC, so a run any evening west of Greenwich stamps the
// measurement with tomorrow's date — and the CHANGELOG beside it is organised by the day's work.
const today = new Date().toLocaleDateString('en-CA');
console.log(`coverage: unit ${unit}% · component ${component}% over ${fileCount} files · ${today}`);

/** Each edit must apply exactly once — a pattern that stopped matching means the prose moved. */
const rewrite = async (relativePath, edits) => {
  const path = resolve(ROOT, relativePath);
  const original = readFileSync(path, 'utf8');
  let next = original;
  for (const [pattern, replacement] of edits) {
    const matches = next.match(new RegExp(pattern.source, `${pattern.flags}g`)) ?? [];
    if (matches.length !== 1) {
      console.error(
        `coverage: expected exactly one match for ${String(pattern)} in ${relativePath}, found ${String(matches.length)} — update the pattern alongside the prose`
      );
      process.exit(1);
    }
    next = next.replace(pattern, replacement);
  }
  next = await formatAs(path, next);
  if (next === original) {
    console.log(`coverage: ${relativePath} already up to date`);
    return;
  }
  writeFileSync(path, next);
  console.log(`coverage: ${relativePath} rewritten`);
};

const badge = (value) => {
  return String(Math.round(Number(value)));
};

await rewrite('README.md', [
  [/unit_coverage-\d+%25/, `unit_coverage-${badge(unit)}%25`],
  [/component_coverage-\d+%25/, `component_coverage-${badge(component)}%25`],
  [/in Node \(c8\) — \*\*[\d.]+%\*\*/, `in Node (c8) — **${unit}%**`],
  [
    /\*\*[\d.]+%\*\* statements over \d+ files/,
    `**${component}%** statements over ${fileCount} files`,
  ],
  [/Both measured \d{4}-\d{2}-\d{2}/, `Both measured ${today}`],
]);
