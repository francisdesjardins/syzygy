import { defineConfig } from '@playwright/test';

const IS_CI = Boolean(process.env['CI']);

/**
 * What one unit test may take. These run in Node with no browser and no page, so a test that
 * reaches ten seconds is hung rather than slow.
 */
const UNIT_TIMEOUT = 10 * 1000;

/**
 * Unit projects only, for now, and no `webServer`.
 *
 * Most of this package is components, so most of its coverage has to come from a component suite —
 * and a component suite needs a page to mount into, which this package does not have. It renders
 * inside the three playgrounds rather than one of its own. Adding that host is the next step and
 * the reason this file is shaped like umbra's rather than like limb's: the `component` project
 * slots in beside `unit`, and the `webServer` beside it, without moving what is already here.
 *
 * What runs today is what answers in Node: the modules with no renderer, no stylesheet import and
 * no virtual module behind them.
 */
export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 1 : '50%',
  timeout: UNIT_TIMEOUT,
  reporter: IS_CI
    ? [['list'], ['html', { outputFolder: 'playwright-report' }]]
    : [['html', { outputFolder: 'playwright-report' }]],
  projects: [
    {
      name: 'unit',
      testMatch: ['**/__tests__/**/*.test.ts'],
    },
  ],
});
