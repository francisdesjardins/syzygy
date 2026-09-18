#!/usr/bin/env node
// ── Every `as` in shipped code sits on a boundary somebody argued for ────────
// A cast is where the type system stops and a claim starts, so the claims are listed here rather
// than counted in prose — a number in a document goes stale the first time anyone refactors, and
// this one had said "three" while the package held six.
//
// Tests are excluded: a test asserts what the types forbid, which is its job.

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(process.cwd(), 'src');

/**
 * The boundaries, and every file allowed to assert one.
 *
 * Adding a file here is the deliberate act this gate exists to require. Adding a *boundary* needs
 * an argument as good as the two below.
 */
const BOUNDARIES = [
  {
    name: 'settled data, re-typed by the step id it was stored under',
    files: ['core/create-bootstrap.ts', 'core/read-data.ts', 'core/step-context.ts'],
  },
  {
    name: 'globalThis, which nothing can describe for another module',
    files: ['core/shared-scope.ts'],
  },
];

const ALLOWED = new Map(
  BOUNDARIES.flatMap((boundary) => {
    return boundary.files.map((file) => {
      return [file, boundary.name];
    });
  })
);

/** `x as T`, but not `as const`, not an `import … as …`, and not a word inside prose. */
const CAST = /\bas\s+(?!const\b)[A-Za-z_$[{(]/;

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : sourceFiles(path);
    }
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/**
 * Strip what a cast cannot hide in.
 *
 * Comments are where this package explains itself and they are full of the word "as"; a string is
 * where a message lives. Line-based and deliberately blunt: a false negative here is a cast nobody
 * reviewed, so the patterns stay wide rather than clever.
 */
function code(line) {
  return line
    .replace(/\/\*.*?\*\//g, '')
    .replace(/^\s*\/\*.*$/, '')
    .replace(/^\s*\*.*$/, '')
    .replace(/\/\/.*$/, '')
    .replace(/'[^']*'/g, "''")
    .replace(/`[^`]*`/g, '``');
}

const found = [];
for (const path of sourceFiles(SRC)) {
  const file = relative(SRC, path).replaceAll('\\', '/');
  readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .forEach((line, index) => {
      if (CAST.test(code(line))) {
        found.push({ file, line: index + 1, text: line.trim() });
      }
    });
}

const stray = found.filter((cast) => {
  return !ALLOWED.has(cast.file);
});
const covered = new Set(
  found.map((cast) => {
    return cast.file;
  })
);
const idle = [...ALLOWED.keys()].filter((file) => {
  return !covered.has(file);
});

if (stray.length > 0 || idle.length > 0) {
  for (const cast of stray) {
    console.error(`  ${cast.file}:${String(cast.line)} — cast on no declared boundary`);
    console.error(`    ${cast.text}`);
  }
  for (const file of idle) {
    console.error(`  ${file} — declared a boundary and holds no cast; drop it from the list`);
  }
  console.error(
    `check:casts: ${String(stray.length + idle.length)} problem(s). Either the cast belongs to a ` +
      `boundary in scripts/check-casts.mjs, or it needs an argument of its own.`
  );
  process.exit(1);
}

const summary = BOUNDARIES.map((boundary) => {
  const count = found.filter((cast) => {
    return boundary.files.includes(cast.file);
  }).length;
  return `${String(count)} on ${boundary.name}`;
}).join(', ');
console.log(`check:casts: ${String(found.length)} casts in shipped src — ${summary}.`);
