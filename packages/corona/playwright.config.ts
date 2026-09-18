import { defineConfig, devices } from '@playwright/test';
import { COMPONENT_TIMEOUT, playwrightBase } from 'gnomon/playwright-base';

const IS_CI = Boolean(process.env['CI']);

/**
 * A coverage run gets its own server on its own port.
 *
 * Reusing one already up would serve an uninstrumented bundle and produce a green run with no
 * counters at all — which reads as a forgotten flag rather than as a wrong answer.
 */
const WITH_COVERAGE = process.env['CT_COVERAGE'] === '1';
const PORT = WITH_COVERAGE ? 3103 : 3003;
const BASE_URL = `http://localhost:${String(PORT)}`;

/**
 * Whether this run needs the gallery served, and only the browser project does.
 *
 * `webServer` is config-level rather than per project, so a unit-only run would start Vite and wait
 * for it before running tests that never open a page.
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
  testDir: './src',
  // Empties `.nyc_output/` before any worker writes into it, and only when coverage is on.
  globalSetup: 'gnomon/ct-coverage-reset',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    serviceWorkers: 'block',
  },
  ...(needsServer
    ? {
        webServer: {
          command: WITH_COVERAGE ? `yarn dev --port ${String(PORT)} --strictPort` : 'yarn dev',
          url: BASE_URL,
          reuseExistingServer: !IS_CI && !WITH_COVERAGE,
          timeout: 120 * 1000,
        },
      }
    : {}),
  projects: [
    {
      name: 'unit',
      testMatch: ['**/__tests__/**/*.test.ts'],
    },
    {
      name: 'component',
      testMatch: ['**/__tests__/**/*.ct.ts'],
      timeout: COMPONENT_TIMEOUT,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
