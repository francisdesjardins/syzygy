#!/usr/bin/env node
/**
 * The agent-instruction budget, for whichever package ran the command.
 *
 * Every `CLAUDE.md` loads in full into every session, so a paragraph costs on every task forever
 * and costs nothing visible when it is written. Nothing else in a repository notices that, which is
 * why it is a gate rather than a habit.
 *
 * The budget is the routing rule made enforceable: a fact belongs first in a test or a gate, then
 * in the JSDoc of the thing it constrains, and in `CLAUDE.md` only when it attaches to no single
 * file. So passing is almost never deleting a fact — it is moving one.
 *
 * **Each file has two lines, and the lower one is the one that bites.** A ceiling alone does not
 * stop a document arriving at 99% of it and staying there, which is exactly what happened: one set
 * sat at 13 498 words of 13 500 while its own doc comment said to land at 90%. A limit reached is a
 * limit that taxes every later session with a word hunt before it can add a sentence. So crossing
 * the headroom line fails too — and the fix is either a trim or a raise, where a raise is a decision
 * stated in the commit that makes it. That is the same rule the ceiling always had; it now applies
 * early enough to act on.
 *
 * The **total** is a hard ceiling and nothing else. It already sums tighter than the per-file
 * budgets on purpose — what costs a session is all of them together — and taking the headroom
 * fraction off it as well would make the real limit a number nobody chose.
 *
 * Read from the package that ran it, the way everything here is: `doc-budget.json` beside the
 * manifest holds the numbers, and the file list is **discovered** rather than declared — a hand-kept
 * index is what a new file gets left off.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = process.cwd();
const CONFIG = resolve(ROOT, 'doc-budget.json');

if (!existsSync(CONFIG)) {
  console.error(`gnomon-doc-budget: no doc-budget.json in ${ROOT}.`);
  process.exit(1);
}

/** @type {{ total: number, headroom: number, files: Record<string, number>, alsoNamingScripts?: string[] }} */
const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
const { total: TOTAL, headroom: HEADROOM, files: BUDGETS } = config;
const ALSO_NAMING_SCRIPTS = config.alsoNamingScripts ?? [];

const failures = [];
const fail = (what) => {
  failures.push(what);
};

/** Words rather than lines: prose reflows, context cost does not. */
const wordsIn = (path) => {
  return readFileSync(resolve(ROOT, path), 'utf8').split(/\s+/).filter(Boolean).length;
};

// ── The file list is discovered, both ways ───────────────────────────────────
//
// A rename makes a budget check pass on nothing; a *new* file is the cheapest way round a budget.
const SKIP = new Set(['node_modules', 'dist', '.git', '.yarn', 'playwright-report', 'coverage']);
// By path, not by name: a worktree an agent leaves under here is a whole checkout, and would answer
// with a second copy of every file. `.claude` itself stays walked — a CLAUDE.md added there is one a
// session would load, and it should want a budget.
const SKIP_PATH = '.claude/worktrees';

const walk = (dir) => {
  return readdirSync(resolve(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = dir === '' ? entry.name : `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      return SKIP.has(entry.name) || path === SKIP_PATH ? [] : walk(path);
    }
    return entry.name === 'CLAUDE.md' ? [path] : [];
  });
};

const found = walk('').sort();
const budgeted = Object.keys(BUDGETS).sort();
if (found.join('\n') !== budgeted.join('\n')) {
  const added = found.filter((path) => !budgeted.includes(path));
  const gone = budgeted.filter((path) => !found.includes(path));
  if (added.length > 0) fail(`not budgeted: ${added.join(', ')} — give each one a budget.`);
  if (gone.length > 0)
    fail(`budgeted but missing: ${gone.join(', ')} — a rename leaves the budget checking nothing.`);
}

// ── The two lines ────────────────────────────────────────────────────────────
const rows = [];
let used = 0;
for (const path of budgeted) {
  if (!existsSync(resolve(ROOT, path))) continue;
  const words = wordsIn(path);
  const budget = BUDGETS[path];
  used += words;
  rows.push({ path, words, budget, share: words / budget });

  if (words > budget) {
    fail(
      `${path}: ${words} words over a budget of ${budget}. Move the new material to a test or to the JSDoc of what it constrains. Raising the budget is a decision to state in the commit.`
    );
  } else if (words > budget * HEADROOM) {
    const line = Math.floor(budget * HEADROOM);
    fail(
      `${path}: ${words} words, ${words - line} past the headroom line of ${line} (${Math.round(HEADROOM * 100)}% of ${budget}). Trim it now, or raise the budget deliberately — a document that lands on its ceiling makes every later edit a word hunt before it can add a sentence.`
    );
  }
}

// The headroom line is per file, because that is where the word hunt happens: you are editing one
// document and it has no room. The total is a hard ceiling and nothing else — it already sums
// tighter than its parts on purpose, and taking the same fraction off it twice would make the real
// budget a number nobody wrote down.
if (used > TOTAL) {
  fail(
    `the set is ${used} words against a total of ${TOTAL}. Every one of these loads in full, every session.`
  );
}

// ── Pointers rot in two ways, and prose hides both ───────────────────────────
//
// Replacing a paragraph with a pointer trades one stale mode for another: a moved paragraph cannot
// go stale, a link can.
const LINK = /\[[^\]]+\]\(([^)#\s]+)(?:#[^)\s]*)?\)/g;
for (const doc of budgeted) {
  if (!existsSync(resolve(ROOT, doc))) continue;
  const base = resolve(ROOT, dirname(doc));
  for (const match of readFileSync(resolve(ROOT, doc), 'utf8').matchAll(LINK)) {
    const target = match[1] ?? '';
    if (target.startsWith('http') || target.startsWith('mailto:')) continue;
    // The escaped `\_\_tests\_\_` markdown links have to be unescaped to be paths again.
    if (!existsSync(resolve(base, target.replaceAll('\\_', '_')))) {
      fail(`${doc} links to ${target}, which does not exist.`);
    }
  }
}

// The one prose hides best: a renamed script leaves the instruction reading perfectly and doing
// nothing.
const SCRIPT = /`yarn ([a-z][\w:-]*)`/g;
const manifest = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
/** Yarn's own verbs, which are not a package's to declare. */
const BUILT_IN = new Set([
  'add',
  'dlx',
  'info',
  'install',
  'node',
  'run',
  'set',
  'workspace',
  'constraints',
  'dedupe',
  'why',
]);

let named = 0;
for (const doc of [...budgeted, ...ALSO_NAMING_SCRIPTS]) {
  if (!existsSync(resolve(ROOT, doc))) continue;
  for (const match of readFileSync(resolve(ROOT, doc), 'utf8').matchAll(SCRIPT)) {
    const name = match[1] ?? '';
    named += 1;
    if (!(name in (manifest.scripts ?? {})) && !BUILT_IN.has(name)) {
      fail(`${doc} names \`yarn ${name}\`, which is not a script in this package.`);
    }
  }
}

// Guards the guard: a pattern that stopped matching passes on an empty list.
if (named < 5) {
  fail(
    `only ${named} \`yarn <script>\` mentions were found across these documents — the pattern has probably stopped matching.`
  );
}

const width = Math.max(...rows.map((row) => row.path.length));
for (const row of rows) {
  const percent = Math.round(row.share * 100);
  const flag = row.words > row.budget ? '  OVER' : row.share > HEADROOM ? '  TIGHT' : '';
  console.log(
    `  ${row.path.padEnd(width)}  ${String(row.words).padStart(5)} / ${String(row.budget).padStart(5)}  ${String(percent).padStart(3)}%${flag}`
  );
}
console.log(
  `  ${'the set'.padEnd(width)}  ${String(used).padStart(5)} / ${String(TOTAL).padStart(5)}  ${String(Math.round((used / TOTAL) * 100)).padStart(3)}%`
);

if (failures.length > 0) {
  console.error(`\ndoc-budget: ${failures.length} failure(s).`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(
  `\ndoc-budget: ${rows.length} file(s) under budget with headroom, every link and every named script resolves.`
);
