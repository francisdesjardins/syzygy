#!/usr/bin/env node
/**
 * Which test suites a change can affect, for the CI Test matrix.
 *
 * A changed file belongs to the workspace whose directory holds it; that workspace and everything
 * depending on it, directly or not, is affected. A playground is tested by its parent's suites, so
 * it counts as its parent. A file outside every workspace is shared configuration and affects
 * everything. Files in `CHECK_ONLY` affect nothing: only `yarn check` reads them.
 *
 * When there is no base to diff against — a first push, a rewritten history, a manual run — every
 * suite runs. Not knowing what changed is not the same as nothing having changed.
 *
 * Usage:
 *   node scripts/ci-plan.mjs --base <sha>        # diff <sha>..HEAD
 *   node scripts/ci-plan.mjs --files a.ts b.ts   # these files, for trying a scenario
 *   node scripts/ci-plan.mjs                     # everything
 *
 * Prints the matrix, and writes `tests=<json>` to `$GITHUB_OUTPUT` when that is set.
 */

import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** One entry per suite, so a red run names the workspace and the engine in the job list. */
const SUITES = [
  { id: 'antumbra-unit', workspace: 'antumbra', script: 'test:unit' },
  { id: 'antumbra-chromium', workspace: 'antumbra', script: 'test:component:chromium' },
  { id: 'antumbra-firefox', workspace: 'antumbra', script: 'test:component:firefox' },
  { id: 'antumbra-webkit', workspace: 'antumbra', script: 'test:component:webkit' },
  { id: 'antumbra-touch', workspace: 'antumbra', script: 'test:component:touch' },
  { id: 'antumbra-touch-webkit', workspace: 'antumbra', script: 'test:component:touch-webkit' },
  { id: 'umbra-unit', workspace: 'umbra', script: 'test:unit' },
  { id: 'umbra-component', workspace: 'umbra', script: 'test:component' },
  { id: 'corona-unit', workspace: 'corona', script: 'test:unit' },
  { id: 'corona-component', workspace: 'corona', script: 'test:component' },
  { id: 'limb-unit', workspace: 'limb', script: 'test' },
];

/**
 * Paths no test reads: documentation, agent tooling, and each package's changelog and agent notes.
 * `yarn check` still covers them. A package's README and API.md are not here — tests read those.
 */
const CHECK_ONLY = [/^docs\//, /^[^/]+\.md$/, /^\.claude\//, /(^|\/)(CHANGELOG|CLAUDE)\.md$/];

const git = (...args) => {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
};

const workspaces = git('ls-files', '*package.json', 'package.json')
  .split('\n')
  .filter((path) => {
    return path !== 'package.json';
  })
  .map((path) => {
    const manifest = JSON.parse(readFileSync(resolve(root, path), 'utf8'));
    const internal = Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })
      .filter(([, range]) => {
        return String(range).startsWith('workspace:');
      })
      .map(([name]) => {
        return name;
      });
    return {
      name: manifest.name,
      dir: dirname(path),
      test: manifest.scripts?.test ?? '',
      scripts: manifest.scripts ?? {},
      internal,
    };
  });

// Every workspace whose `test` runs something must have a suite here, or it is silently skipped.
const missing = workspaces.filter((workspace) => {
  const runs = workspace.test !== '' && !workspace.test.startsWith('echo');
  return (
    runs &&
    !SUITES.some((suite) => {
      return suite.workspace === workspace.name;
    })
  );
});
const unknownScripts = SUITES.filter((suite) => {
  const workspace = workspaces.find((candidate) => {
    return candidate.name === suite.workspace;
  });
  return !workspace?.scripts[suite.script];
});
if (missing.length > 0 || unknownScripts.length > 0) {
  for (const workspace of missing) {
    console.error(`ci-plan: ${workspace.name} has tests that no suite in SUITES runs.`);
  }
  for (const suite of unknownScripts) {
    console.error(`ci-plan: ${suite.workspace} has no \`${suite.script}\` script (${suite.id}).`);
  }
  process.exit(1);
}

/** The workspace a playground belongs to, since its tests run in the parent's projects. */
const owner = (workspace) => {
  const parent = workspaces.find((candidate) => {
    return candidate !== workspace && workspace.dir.startsWith(`${candidate.dir}/`);
  });
  return parent ?? workspace;
};

const workspaceOf = (file) => {
  const holders = workspaces.filter((workspace) => {
    return file.startsWith(`${workspace.dir}/`);
  });
  return holders.sort((a, b) => {
    return b.dir.length - a.dir.length;
  })[0];
};

const changedFiles = () => {
  const args = process.argv.slice(2);
  if (args[0] === '--files') {
    return args.slice(1);
  }
  if (args[0] === '--base' && args[1]) {
    try {
      git('cat-file', '-e', `${args[1]}^{commit}`);
      return git('diff', '--name-only', `${args[1]}...HEAD`).split('\n').filter(Boolean);
    } catch {
      console.log(`ci-plan: base ${args[1]} is not in this history — running everything.`);
    }
  }
  return null;
};

const plan = () => {
  const files = changedFiles();
  if (files === null) {
    return SUITES;
  }
  const affected = new Set();
  for (const file of files) {
    if (
      CHECK_ONLY.some((pattern) => {
        return pattern.test(file);
      })
    ) {
      continue;
    }
    const workspace = workspaceOf(file);
    if (workspace) {
      affected.add(workspace.name);
    } else {
      console.log(`ci-plan: ${file} is shared configuration — running everything.`);
      return SUITES;
    }
  }
  // Everything that depends on an affected workspace is affected too.
  for (let grew = true; grew;) {
    grew = false;
    for (const workspace of workspaces) {
      if (
        !affected.has(workspace.name) &&
        workspace.internal.some((name) => {
          return affected.has(name);
        })
      ) {
        affected.add(workspace.name);
        grew = true;
      }
    }
  }
  const tested = new Set(
    workspaces
      .filter((workspace) => {
        return affected.has(workspace.name);
      })
      .map((workspace) => {
        return owner(workspace).name;
      })
  );
  const names = [...affected].sort((a, b) => {
    return a.localeCompare(b);
  });
  console.log(`ci-plan: affected ${names.join(', ') || 'nothing'}.`);
  return SUITES.filter((suite) => {
    return tested.has(suite.workspace);
  });
};

const suites = plan();
console.log(
  `ci-plan: ${String(suites.length)} of ${String(SUITES.length)} suites — ${
    suites
      .map((suite) => {
        return suite.id;
      })
      .join(', ') || 'none'
  }`
);
if (process.env['GITHUB_OUTPUT']) {
  appendFileSync(process.env['GITHUB_OUTPUT'], `tests=${JSON.stringify(suites)}\n`);
}
