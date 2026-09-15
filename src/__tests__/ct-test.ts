import { test as base } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The CT `test`, carrying `mount` and two automatic fixtures: coverage, and a guard on uncaught
 * page errors. `auto: true` applies the latter two unasked — the price is every CT file importing
 * `test` from here, which `ct-test-wiring.test.ts` holds.
 */

/**
 * The ids the gallery door will answer to.
 *
 * Declared as an interface so a harness file can widen it where it lives, rather than every id
 * being a bare string the test file spells and the registry hopes to match.
 */
export type StoryId =
  | 'react-bootstrap'
  | 'solid-bootstrap'
  | 'react-no-provider'
  | 'solid-no-provider';

declare global {
  var __coverage__: Record<string, unknown> | undefined;
  interface Window {
    mount: (params: { story: string }) => Promise<void>;
    unmount: () => Promise<void>;
  }
}

const OUTPUT_DIR = resolve(import.meta.dirname, '../../.nyc_output');

let written = 0;

export const test = base.extend<{
  coverage: void;
  uncaught: void;
  openStory: (story: StoryId) => Promise<void>;
}>({
  /**
   * Open the gallery door and render one harness into it.
   *
   * The door imports the stories and nothing else — no router, no providers, no layout — so a
   * failure is the binding's rather than the app's. Every CT goes through here instead of spelling
   * the navigation out, which is what keeps `?gallery` and the mount contract in one place.
   */
  openStory: async ({ page }, use) => {
    // oxlint-disable-next-line react-hooks/rules-of-hooks -- Playwright's fixture callback, not React's `use` hook: the rule matches on the name alone
    await use(async (story: StoryId) => {
      await page.goto('/?gallery');
      await page.evaluate(async (id) => {
        await window.mount({ story: id });
      }, story);
    });
  },
  /**
   * An exception nothing in the page catches fails the test that provoked it. A spec asserts what
   * it looks at, so one thrown *after* the work it measures is done leaves every assertion green —
   * and `pageerror` carries an unhandled rejection as well. No opt-out: a test that wants an
   * exception catches it in the page and asserts on what it caught.
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
   * A CT subject runs in the browser, so c8 has no Node process:
   * `scripts/vite-plugin-ct-coverage.mjs` instruments the source into the bundle, counters land on
   * `window.__coverage__` in that page, and this reads them back before the page closes, writing
   * one file per test to `.nyc_output/` for the report step to merge. Inert without
   * `CT_COVERAGE=1`. Counters carry *source* line numbers, which that plugin exists to arrange.
   * `.nyc_output/` is emptied per run by `scripts/ct-coverage-reset.mjs`, since a file outliving
   * its run merges into the next report.
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
