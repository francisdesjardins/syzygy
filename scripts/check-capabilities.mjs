#!/usr/bin/env node
/**
 * The four places that name a playground's capability agree.
 *
 * A capability — `dialog`, `boot`, `design` — is written down four times, and each copy does a
 * different job: `deploy.mjs` decides what gets built and where it lands, `_redirects` makes the
 * bare directory resolve on the host, home's dev server does the same thing one layer earlier, and
 * `check-mobile` is the only thing that ever visits the result.
 *
 * **Missing from any one of them fails silently, and in the same direction.** A request for a
 * playground with no rule falls through to the SPA, which answers 200 with the home page — so the
 * visitor gets a page that is not a 404 under a URL that promised something else. It happened
 * twice while the third playground was being added: once in the dev middleware, once in
 * `_redirects`, and neither showed up in a build, a type-check or a lint.
 *
 * `deploy.mjs` is the source: it is the one that decides a capability exists at all.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => {
  return readFileSync(join(root, ...parts), 'utf8');
};

const listOf = (text, pattern) => {
  return new Set(
    [...text.matchAll(pattern)].map((match) => {
      return match[1];
    })
  );
};

const declared = listOf(read('deploy.mjs'), /capability: '([a-z-]+)'/g);

const sources = [
  [
    'apps/home/public/_redirects',
    listOf(read('apps/home/public/_redirects'), /^\/playground\/([a-z-]+)\/ /gm),
  ],
  [
    'apps/home/vite.config.ts',
    new Set(
      (/\(\?:([a-z|-]+)\)/.exec(read('apps/home/vite.config.ts'))?.[1] ?? '')
        .split('|')
        .filter(Boolean)
    ),
  ],
  [
    'scripts/check-mobile.mjs',
    listOf(read('scripts/check-mobile.mjs'), /'\/playground\/([a-z-]+)\/#/g),
  ],
];

const failures = [];

if (declared.size < 2) {
  failures.push(
    `Read ${String(declared.size)} capabilities from deploy.mjs. The pattern stopped matching, which would\n  make every list below agree with an empty one.`
  );
}

for (const [where, found] of sources) {
  const missing = [...declared].filter((capability) => {
    return !found.has(capability);
  });
  const extra = [...found].filter((capability) => {
    return !declared.has(capability);
  });
  if (missing.length > 0) {
    failures.push(
      `${where} does not name: ${missing.join(', ')}.\n  A request for one of those falls through to the SPA, which answers 200 with the home page.`
    );
  }
  if (extra.length > 0) {
    failures.push(
      `${where} names ${extra.join(', ')}, which deploy.mjs does not build.\n  A rule pointing at a directory the deploy never fills is the same silent wrong answer.`
    );
  }
}

if (failures.length > 0) {
  console.error('\ncheck:capabilities: the lists disagree.\n');
  for (const failure of failures) {
    console.error(`  ${failure}\n`);
  }
  process.exit(1);
}

console.log(
  `check:capabilities: ${[...declared].sort((a, b) => a.localeCompare(b)).join(', ')} — named identically in deploy.mjs, _redirects, the dev server and the mobile gate.`
);
