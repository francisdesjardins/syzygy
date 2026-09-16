import { defineConfig } from '@playwright/test';

/**
 * Unit projects only, and no `webServer`.
 *
 * Every module here is framework-free by the package's own rule, so nothing under test needs a page,
 * a bundler or a server to answer for it. A browser project would be a claim this package cannot
 * make.
 */
export default defineConfig({
  testDir: './src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? 'dot' : 'list',
  projects: [{ name: 'unit' }],
});
