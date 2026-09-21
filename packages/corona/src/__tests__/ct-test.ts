import { test as base } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The CT `test`, carrying `openStory` and two automatic fixtures: coverage, and a guard on uncaught
 * page errors. `auto: true` applies the latter two unasked, so every CT file imports `test` from
 * here rather than from Playwright.
 *
 * The same shape umbra's and antumbra's carry, with one difference: the gallery has a single door,
 * because this package has no application to fork away from.
 */

declare global {
  var __coverage__: Record<string, unknown> | undefined;
  interface Window {
    mount: (params: { story: string; props?: Record<string, unknown> }) => Promise<void>;
    unmount: () => Promise<void>;
  }
}

const OUTPUT_DIR = resolve(import.meta.dirname, '../../.nyc_output');

let written = 0;

export const test = base.extend<{
  coverage: void;
  uncaught: void;
  openStory: (story: string, props?: Record<string, unknown>) => Promise<void>;
}>({
  /**
   * Open the gallery and render one harness into it.
   *
   * Every CT goes through here instead of spelling the navigation out, which keeps the page and the
   * mount contract in one place.
   */
  openStory: async ({ page }, use) => {
    // oxlint-disable-next-line react-hooks/rules-of-hooks -- Playwright's fixture callback, not React's `use` hook: the rule matches on the name alone
    await use(async (story: string, props?: Record<string, unknown>) => {
      /*
       * The door is a module and `goto` resolves on `load`, so the function is waited for rather
       * than assumed. The retry is the other half: a dependency discovered mid-session re-runs
       * Vite's optimizer and reloads the page, destroying the context the wait runs in.
       */
      for (let attempt = 0; ; attempt += 1) {
        try {
          await page.goto('/');
          await page.waitForFunction(() => {
            return typeof window.mount === 'function';
          });
          break;
        } catch (error: unknown) {
          if (attempt >= 2) {
            throw error;
          }
        }
      }
      await page.evaluate(
        async ({ id, given }) => {
          // Spread rather than passed: `exactOptionalPropertyTypes` makes an explicit `undefined`
          // a different thing from an absent key, and `mount` declares the key optional.
          await window.mount({ story: id, ...(given === undefined ? {} : { props: given }) });
        },
        { id: story, given: props }
      );
    });
  },
  /**
   * An exception nothing in the page catches fails the test that provoked it. A spec asserts what
   * it looks at, so one thrown *after* the work it measures is done leaves every assertion green —
   * and `pageerror` carries an unhandled rejection as well.
   */
  uncaught: [
    async ({ page }, use) => {
      const thrown: string[] = [];
      page.on('pageerror', (error) => {
        // The stack, so a red names the file rather than only the sentence.
        thrown.push(error.stack ?? error.message);
      });

      await use();

      if (thrown.length > 0) {
        throw new Error(`The page threw and nothing caught it:\n\n${thrown.join('\n\n')}`);
      }
    },
    { auto: true },
  ],
  /**
   * A CT subject runs in the browser, so c8 has no Node process: gnomon's instrumenter instruments
   * the source into the bundle, counters land on `window.__coverage__`, and this reads them back
   * before the page closes. Inert without `CT_COVERAGE=1`.
   */
  coverage: [
    // Playwright's fixture signature, not ours — the three parameters are the shape `extend` calls.
    // oxlint-disable-next-line max-params
    async ({ page }, use, testInfo) => {
      await use();

      // The page is still alive during fixture teardown — why this is a fixture, not an afterEach.
      const data = await page.evaluate(() => {
        return globalThis.__coverage__;
      });
      if (!data) {
        return;
      }

      mkdirSync(OUTPUT_DIR, { recursive: true });
      written += 1;
      // Unique per test *and* worker: workers are separate processes, so equal indexes collide.
      const name = `ct-${String(testInfo.workerIndex)}-${String(written)}.json`;
      writeFileSync(resolve(OUTPUT_DIR, name), JSON.stringify(data), 'utf8');
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
