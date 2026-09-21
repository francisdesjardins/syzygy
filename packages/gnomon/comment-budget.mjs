// The scanner behind each package's comment-budget test: **why, not what**, **never the past**,
// **one dense sentence beats a paragraph**. A rule that lives only in prose is one every later
// session has to be reminded of, and a rule enforced in one package of six is barely a rule.
//
// The numbers, the roots and the exemptions belong to the caller, because those are the parts a
// package can honestly disagree about. The parsing is not.

import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

/** A directive is machinery, not prose, so it neither counts nor joins the block above it. */
const DIRECTIVE =
  /^\s*(?:\/\/|\/\*)\s*(?:oxlint-|oxfmt-|eslint-|@ts-|prettier-|\/\s*<reference|biome-)/;

/** Section rails (`── Placement ──`) are structure, and a rule against them would only move them. */
const RAIL = /[\u2500-\u257f]{2,}/;

const PAST = /\b(?:used to|formerly|historically|in the past)\b/i;

/** Words rather than lines: prose reflows, the reading cost does not. */
function countWords(text) {
  return text
    .split('\n')
    .filter((line) => {
      return !RAIL.test(line);
    })
    .join(' ')
    .replace(/[`*_>#|]/g, ' ')
    .split(/\s+/)
    .filter((token) => {
      return /[\p{L}\p{N}]/u.test(token);
    }).length;
}

/**
 * The comment ranges in a source file, and **the string literals are the reason this is a scanner
 * rather than a regex**: source files carry prose in data, including the words banned below, and a
 * line-based match would gate on it.
 *
 * A `/` opens a regex only where a value cannot already have ended — the standard heuristic, and
 * enough here because the alternative it has to beat is division.
 */
function scanComments(source) {
  const found = [];
  let line = 1;
  let index = 0;
  let lastSignificant = '';

  const skipTo = (end) => {
    for (let at = index; at < end; at++) {
      if (source[at] === '\n') {
        line++;
      }
    }
    index = end;
  };

  while (index < source.length) {
    const char = source[index] ?? '';
    const next = source[index + 1] ?? '';

    if (char === '/' && next === '/') {
      const end = source.indexOf('\n', index);
      const stop = end === -1 ? source.length : end;
      found.push({ pos: index, end: stop, line });
      index = stop;
      continue;
    }

    if (char === '/' && next === '*') {
      const end = source.indexOf('*/', index + 2);
      const stop = end === -1 ? source.length : end + 2;
      found.push({ pos: index, end: stop, line });
      skipTo(stop);
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      let at = index + 1;
      while (at < source.length && source[at] !== char) {
        at += source[at] === '\\' ? 2 : 1;
      }
      skipTo(Math.min(at + 1, source.length));
      lastSignificant = char;
      continue;
    }

    if (char === '/' && /[(,=:[!&|?{};+\-*%~^<>]/.test(lastSignificant)) {
      let at = index + 1;
      let inClass = false;
      while (at < source.length) {
        const here = source[at];
        if (here === '\\') {
          at += 2;
          continue;
        }
        if (here === '[') {
          inClass = true;
        } else if (here === ']') {
          inClass = false;
        } else if ((here === '/' && !inClass) || here === '\n') {
          break;
        }
        at++;
      }
      skipTo(Math.min(at + 1, source.length));
      lastSignificant = '/';
      continue;
    }

    if (char === '\n') {
      line++;
    } else if (!/\s/.test(char)) {
      lastSignificant = char;
    }
    index++;
  }

  return found;
}

/** Contiguous `//` lines are one block, since that is how they are read and how they grow. */
function commentBlocks(source) {
  const blocks = [];
  let run = null;

  const flush = () => {
    if (run === null) {
      return;
    }
    const text = run.parts.join('\n');
    blocks.push({
      kind: 'line',
      line: run.line,
      text,
      words: countWords(text.replace(/^[ \t]*\/\/ ?/gm, '')),
      internal: false,
    });
    run = null;
  };

  for (const range of scanComments(source)) {
    const text = source.slice(range.pos, range.end);
    if (DIRECTIVE.test(text)) {
      flush();
      continue;
    }
    if (text.startsWith('//')) {
      if (run !== null && range.line === run.nextLine) {
        run.parts.push(text);
        run.nextLine = range.line + 1;
      } else {
        flush();
        run = { line: range.line, parts: [text], nextLine: range.line + 1 };
      }
      continue;
    }
    flush();
    blocks.push({
      kind: text.startsWith('/**') ? 'jsdoc' : 'block',
      line: range.line,
      text,
      words: countWords(
        text
          .replace(/^\/\*\*?/, '')
          .replace(/\*\/$/, '')
          .replace(/^[ \t]*\*[ \t]?/gm, '')
      ),
      internal: /@internal\b/.test(text),
    });
  }

  flush();
  return blocks;
}

function sourceFiles(from, into = []) {
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const path = resolve(from, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        sourceFiles(path, into);
      }
    } else if (/\.tsx?$/.test(entry.name)) {
      into.push(path);
    }
  }
  return into;
}

function isTest(rel) {
  return rel.includes('__tests__') || /\.(?:ct|story)\.tsx?$/.test(rel);
}

/**
 * Read the two budgets and the two lists a package's test asserts on.
 *
 * `root` is the package directory; `roots` the trees under it to scan. The public-API exception is
 * read the only mechanical way there is — the block's own `@internal` — and it reaches JSDoc alone,
 * because a `//` run and a bare block comment document neither a signature nor an export.
 *
 * `pastExemptions` is where a package names a platform term it cannot spell another way; each entry
 * is `[pattern, replacement]` applied before the past-tense scan.
 */
export function commentBudget({
  root,
  roots = ['src'],
  lineBudget = 50,
  jsdocBudget = 120,
  pastExemptions = [],
}) {
  const entries = [];
  for (const tree of roots) {
    for (const file of sourceFiles(resolve(root, tree))) {
      const rel = relative(root, file).split('\\').join('/');
      for (const block of commentBlocks(readFileSync(file, 'utf8'))) {
        entries.push({ rel, block });
      }
    }
  }

  const budgetFor = (rel, block) => {
    if (block.kind !== 'jsdoc') {
      return lineBudget;
    }
    return block.internal || rel.startsWith('playground/') || isTest(rel) ? jsdocBudget : null;
  };

  const over = entries
    .filter((entry) => {
      const budget = budgetFor(entry.rel, entry.block);
      return budget !== null && entry.block.words > budget;
    })
    .map((entry) => {
      return `${entry.rel}:${String(entry.block.line)} — ${String(entry.block.words)} words`;
    });

  const narrating = entries
    .filter((entry) => {
      let prose = entry.block.text.replace(/^[ \t]*(?:\/\/|\*)[ \t]?/gm, '').replace(/\s+/g, ' ');
      for (const [pattern, replacement] of pastExemptions) {
        prose = prose.replace(pattern, replacement);
      }
      return PAST.test(prose) || /\bpreviously\b/i.test(prose);
    })
    .map((entry) => {
      return `${entry.rel}:${String(entry.block.line)}`;
    });

  const files = new Set(
    entries.map((entry) => {
      return entry.rel;
    })
  );

  return { blocks: entries.length, files: files.size, over, narrating };
}

/** What a failing assertion should say, kept here so six packages cannot word it six ways. */
export const OVER_BUDGET =
  'One dense sentence beats a paragraph. Move the rest up to the JSDoc of what it constrains, or down into the test that proves it.';

export const NARRATING =
  'docs/decisions/ is the history. State the invariant that holds now, rather than the shape it replaced.';
