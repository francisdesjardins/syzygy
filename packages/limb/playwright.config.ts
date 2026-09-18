import { defineConfig } from '@playwright/test';
import { playwrightBase } from 'gnomon/playwright-base';

/**
 * Unit projects only, and no `webServer`.
 *
 * Every module here is framework-free by the package's own rule, so nothing under test needs a page,
 * a bundler or a server to answer for it. A browser project would be a claim this package cannot
 * make.
 */
export default defineConfig({
  ...playwrightBase(),
  testDir: './src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  projects: [{ name: 'unit' }],
});
