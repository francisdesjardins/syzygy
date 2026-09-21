#!/usr/bin/env node
/**
 * The comment budget, for whichever package ran the command.
 *
 * **Why, not what. Never the past. One dense sentence beats a paragraph.** Every `CLAUDE.md` in this
 * repository argues those three, and for a while exactly one package enforced them — which makes
 * them a habit the next session has to be reminded of rather than a rule.
 *
 * A command rather than a test, like `doc-budget` and `token-usage` beside it, because the packages
 * that need it most are not all packages that run a test runner: penumbra is two stylesheets and a
 * demo, and its demo has the same prose problem as everything else.
 *
 * Passing is almost never deleting a fact. It is moving one up to the JSDoc of what it constrains,
 * or down into the test that proves it.
 *
 * `comment-budget.json` beside the manifest holds the roots, the two budgets and the floors. The
 * floors are what stop a pass from being vacuous: every way this has to fail quietly is by finding
 * nothing — a broken walk, a scanner stopping at the first construct it cannot read.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { commentBudget, NARRATING, OVER_BUDGET } from './comment-budget.mjs';

const ROOT = process.cwd();
const CONFIG = resolve(ROOT, 'comment-budget.json');

if (!existsSync(CONFIG)) {
  console.error(`comment-budget: no comment-budget.json in ${ROOT}`);
  process.exit(1);
}

/**
 * @type {{
 *   roots: string[],
 *   lineBudget?: number,
 *   jsdocBudget?: number,
 *   floors: { blocks: number, files: number },
 *   pastExemptions?: [string, string][],
 * }}
 */
const config = JSON.parse(readFileSync(CONFIG, 'utf8'));

const found = commentBudget({
  root: ROOT,
  roots: config.roots,
  ...(config.lineBudget === undefined ? {} : { lineBudget: config.lineBudget }),
  ...(config.jsdocBudget === undefined ? {} : { jsdocBudget: config.jsdocBudget }),
  // Written as strings in JSON, since a regular expression is not a JSON value.
  pastExemptions: (config.pastExemptions ?? []).map(([pattern, replacement]) => {
    return [new RegExp(pattern, 'gi'), replacement];
  }),
});

const failures = [];

if (found.blocks < config.floors.blocks || found.files < config.floors.files) {
  failures.push(
    `the scan found ${String(found.blocks)} blocks in ${String(found.files)} files, under the floor of ${String(config.floors.blocks)} and ${String(config.floors.files)} — so a pass here would mean nothing`
  );
}
for (const over of found.over) {
  failures.push(`${over} — ${OVER_BUDGET}`);
}
for (const narrating of found.narrating) {
  failures.push(`${narrating} — ${NARRATING}`);
}

if (failures.length > 0) {
  console.error(`comment-budget: ${String(failures.length)} failure(s).`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `comment-budget: ${String(found.blocks)} comment blocks across ${String(found.files)} files, every one inside its budget and none narrating the past.`
);
