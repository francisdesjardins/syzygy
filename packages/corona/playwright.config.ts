import { defineConfig } from '@playwright/test';
import { playwrightBase } from 'gnomon/playwright-base';

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
  ...playwrightBase(),
  testDir: './src',
  projects: [
    {
      name: 'unit',
      testMatch: ['**/__tests__/**/*.test.ts'],
    },
  ],
});
