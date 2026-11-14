#!/usr/bin/env node
/**
 * The four places that name the folder a playground is served from agree.
 *
 * A playground's folder — `playground/<capability>`, or the path its entry in `deploy.mjs` gives it
 * — is written down four times, and each copy does a different job: `deploy.mjs` decides what gets
 * built and where it lands, `_redirects` makes the bare directory resolve on the host, home's dev
 * server does the same thing one layer earlier, and `check-layout` is the only thing that ever
 * visits the result. A playground served at a path of its own keeps its capability's address as a
 * permanent redirect, and corona's drawer links each playground where it is served. Bead's demo is
 * served at its own domain, https://beadproto.dev/playground/, deployed from Bead's repository: the
 * drawer and the home link it there, by an `https://` address this check holds to be one, and
 * nothing here fills a folder for it.
 *
 * **Missing from any one of them fails silently, and in the same direction.** A request for a
 * playground with no rule falls through to the SPA, which answers 200 with the home page — so the
 * visitor gets a page that is not a 404 under a URL that promised something else. It happened
 * twice while the third playground was being added: once in the dev middleware, once in
 * `_redirects`, and neither showed up in a build, a type-check or a lint.
 *
 * `deploy.mjs` is the source: it is the one that decides a capability exists at all.
 *
 * **Order is checked separately, and only where a reader sees one.** The four lists above are
 * lookups, so the order in them means nothing. Two other places present the three *to a person* —
 * corona's `PLAYGROUNDS`, which draws every playground's drawer, and the home page's own column —
 * and those sat in one arbitrary order until somebody asked why. They follow the light, then the
 * eclipse outward from the middle, and this is what keeps the second copy from drifting off the
 * first. The home links Bead's tile to its page and its demo at Bead's own domain, so a link of the
 * home is read as the playground of the drawer's entry on the same host.
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

// The table's entries, each a capability and the folder it is served from: its own `path`, or
// `playground/<capability>`, as `servedAt` in deploy.mjs reads it.
const deploy = read('deploy.mjs');
const tableOf = (name) => {
  return new RegExp(String.raw`const ${name} = \[([\s\S]*?)\n\];`).exec(deploy)?.[1] ?? '';
};
const playgroundsTable = tableOf('PLAYGROUNDS');
const served = new Map(
  [...playgroundsTable.matchAll(/\{([^{}]*)\}/g)].flatMap(([, entry]) => {
    const capability = /capability: '([a-z-]+)'/.exec(entry)?.[1];
    if (capability === undefined) {
      return [];
    }
    return [[capability, /path: '([a-z/-]+)'/.exec(entry)?.[1] ?? `playground/${capability}`]];
  })
);
const declared = new Set(served.keys());
const playgroundFolders = new Set(served.values());
const ownPaths = [...served].filter(([capability, folder]) => {
  return folder !== `playground/${capability}`;
});

const failures = [];

if (declared.size < 2) {
  failures.push(
    `Read ${String(declared.size)} capabilities from deploy.mjs. The pattern stopped matching, which would\n  make every list below agree with an empty one.`
  );
}
if (ownPaths.length !== [...playgroundsTable.matchAll(/^\s*path: '/gm)].length) {
  failures.push(
    `deploy.mjs's PLAYGROUNDS gives ${String([...playgroundsTable.matchAll(/^\s*path: '/gm)].length)} entries a path of their own, and ${String(ownPaths.length)} were read. The pattern stopped matching, which would\n  hold an exception to the folder it moved away from.`
  );
}
// Each place names folders, not capabilities: a playground served at a path of its own would go
// missing there unseen by a list of capabilities.
const everyFolder = playgroundFolders;
const sources = [
  [
    'apps/home/public/_redirects',
    listOf(read('apps/home/public/_redirects'), /^\/([a-z/-]+)\/ \/\1\/index\.html 200$/gm),
    everyFolder,
  ],
  [
    'apps/home/vite.config.ts',
    listOf(
      /const BUILT_FOLDERS[^=]*= \[([^\]]*)\]/.exec(read('apps/home/vite.config.ts'))?.[1] ?? '',
      /'([a-z/-]+)'/g
    ),
    everyFolder,
  ],
  [
    'scripts/check-layout.mjs',
    listOf(read('scripts/check-layout.mjs'), /\['\/([a-z/-]+)\/#/g),
    playgroundFolders,
  ],
];

for (const [where, found, expected] of sources) {
  const missing = [...expected].filter((folder) => {
    return !found.has(folder);
  });
  const extra = [...found].filter((folder) => {
    return !expected.has(folder);
  });
  if (missing.length > 0) {
    failures.push(
      `${where} does not name: /${missing.join('/, /')}/.\n  A request for one of those falls through to the SPA, which answers 200 with the home page.`
    );
  }
  if (extra.length > 0) {
    failures.push(
      `${where} names /${extra.join('/, /')}/, which deploy.mjs does not fill.\n  A rule pointing at a directory the deploy never fills is the same silent wrong answer.`
    );
  }
}

// A playground served at a path of its own still answers at `/playground/<capability>`, both forms,
// by a permanent redirect: that address is the promise the capability made.
const redirects = read('apps/home/public/_redirects');
for (const [capability, folder] of ownPaths) {
  for (const rule of [
    `/playground/${capability} /${folder}/ 301`,
    `/playground/${capability}/* /${folder}/:splat 301`,
  ]) {
    if (!redirects.split(/\r?\n/).includes(rule)) {
      failures.push(
        `apps/home/public/_redirects lacks \`${rule}\`.\n  ${capability} is served at /${folder}/, and its capability's address has to keep answering.`
      );
    }
  }
}

// The two listings a reader meets, in the order they are read in.
const ordered = (text, pattern) => {
  return [...text.matchAll(pattern)].map((match) => {
    return match[1];
  });
};

// Each drawer entry: its slug, and the folder of this site it links, or the `https://` address of
// the domain it is served at.
const drawer = [
  ...read('packages/corona/src/site/playgrounds.ts').matchAll(
    /\{ slug: '([a-z-]+)', name: '[A-Za-z]+', href: '([^']+)' \}/g
  ),
].map(([, slug, href]) => {
  const folder = /^\/([a-z/-]+)\/$/.exec(href)?.[1];
  return { slug, href, folder };
});
const canonical = drawer.map(({ slug }) => {
  return slug;
});
const capabilityAt = new Map(
  [...served].map(([capability, folder]) => {
    return [folder, capability];
  })
);
// a playground served at a domain of its own, by that domain
const elsewhereAt = new Map(
  drawer.flatMap(({ slug, href, folder }) => {
    return folder === undefined && URL.canParse(href) ? [[new URL(href).host, slug]] : [];
  })
);
const linked = ordered(read('apps/home/src/pages/Home.tsx'), /href(?:=|: )["']([^"']+)["']/g)
  .map((href) => {
    const folder = /^\/([a-z/-]+)\//.exec(href)?.[1];
    if (folder !== undefined) {
      return capabilityAt.get(folder);
    }
    return URL.canParse(href) ? elsewhereAt.get(new URL(href).host) : undefined;
  })
  .filter((capability) => {
    return capability !== undefined;
  });
// a tile and its own links name one playground once
const onHome = linked.filter((capability, index) => {
  return capability !== linked[index - 1];
});

for (const { slug, href, folder } of drawer) {
  if (folder === undefined) {
    if (served.has(slug)) {
      failures.push(
        `corona's PLAYGROUNDS links ${slug} at ${href}, and deploy.mjs serves it at /${served.get(slug)}/.`
      );
    } else if (!URL.canParse(href) || new URL(href).protocol !== 'https:') {
      failures.push(
        `corona's PLAYGROUNDS links ${slug} at ${href}: a playground this site does not serve is linked by its https:// address.`
      );
    }
  } else if (served.get(slug) !== folder) {
    failures.push(
      `corona's PLAYGROUNDS links ${slug} at /${folder}/, and deploy.mjs serves it at /${String(served.get(slug))}/.\n  Every other playground's drawer would link to a page that is not there.`
    );
  }
}

const onSite = drawer.filter(({ folder }) => {
  return folder !== undefined;
});
if (onSite.length !== declared.size) {
  failures.push(
    `corona's PLAYGROUNDS links ${String(onSite.length)} of ${String(declared.size)} capabilities on this site. The pattern stopped matching, or a playground has no drawer entry.`
  );
} else if (canonical.join() !== onHome.join()) {
  failures.push(
    `The home page shows ${onHome.join(', ')} and the drawer shows ${canonical.join(', ')}. Both are read by a person, so two orders is two answers to one question — PLAYGROUNDS is the one to follow.`
  );
}

if (failures.length > 0) {
  console.error('\ncheck:capabilities: the lists disagree.\n');
  for (const failure of failures) {
    console.error(`  ${failure}\n`);
  }
  process.exit(1);
}

console.log(
  `check:capabilities: ${[...declared]
    .sort((a, b) => a.localeCompare(b))
    .map((capability) => {
      return `${capability} at /${served.get(capability)}/`;
    })
    .join(
      ', '
    )} — named identically in deploy.mjs, _redirects, the dev server, the layout gate and the drawer; ${[
    ...elsewhereAt,
  ]
    .map(([host, slug]) => {
      return `${slug} at ${host}`;
    })
    .join(', ')} — and shown as ${canonical.join(' → ')} by both the drawer and the home page.`
);
