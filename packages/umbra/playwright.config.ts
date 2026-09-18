import { defineConfig, devices } from '@playwright/test';
import { COMPONENT_TIMEOUT, playwrightBase } from 'gnomon/playwright-base';

const IS_CI = Boolean(process.env['CI']);

/**
 * Whether this run measures the component suite, and the two things that follow from it.
 *
 * A coverage run needs **its own** dev server: reusing one already on the ordinary port would
 * serve an uninstrumented bundle and produce a green run with no counters at all — which reads as
 * a forgotten flag rather than as a wrong answer. So it takes a port of its own and refuses to
 * reuse anything. Ports are assigned per workspace now, so a sibling cannot poison this one either.
 */
const WITH_COVERAGE = process.env['CT_COVERAGE'] === '1';
const PORT = WITH_COVERAGE ? 3102 : 3002;
const BASE_URL = `http://localhost:${String(PORT)}`;

/**
 * Whether this run needs the playground served, and only the browser project does.
 *
 * `webServer` is config-level rather than per project, so a unit-only run would start Vite and wait
 * for it before running tests that never open a page — and a unit run a broken playground can fail
 * is a unit run reporting on something it does not test. Every script that selects a project names
 * it on the command line, so a selection of `unit` alone is the one case that can skip the server.
 */
const selectedProjects = process.argv.flatMap((arg, index) => {
  if (arg.startsWith('--project=')) {
    return [arg.slice('--project='.length)];
  }
  return arg === '--project' ? [process.argv[index + 1] ?? ''] : [];
});
const needsServer =
  selectedProjects.length === 0 ||
  process.argv.includes('--ui') ||
  selectedProjects.some((project) => {
    return project !== 'unit';
  });

export default defineConfig({
  ...playwrightBase({ ci: IS_CI }),
  testDir: './',
  // Empties `.nyc_output/` before any worker writes into it, and only when coverage is on.
  globalSetup: 'gnomon/ct-coverage-reset',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    // A cached response shadowing a fresh bundle is the one failure that reads as a flaky test
    // rather than a stale page, and the playground registers no worker of its own to lose.
    serviceWorkers: 'block',
  },
  ...(needsServer
    ? {
        webServer: {
          command: WITH_COVERAGE ? `yarn dev --port ${String(PORT)} --strictPort` : 'yarn dev',
          url: `${BASE_URL}/?gallery=1`,
          reuseExistingServer: !IS_CI && !WITH_COVERAGE,
          timeout: 120 * 1000,
        },
      }
    : {}),
  projects: [
    {
      name: 'unit',
      // Rooted at the repo rather than `src`, because the playground grows helpers of its own and a
      // helper's claim on a test does not depend on which workspace it ships from.
      testDir: './',
      testMatch: ['{src,playground/src}/**/__tests__/**/*.test.ts'],
    },
    {
      name: 'component',
      testDir: './',
      testMatch: ['{src,playground/src}/**/__tests__/**/*.ct.ts'],
      timeout: COMPONENT_TIMEOUT,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
