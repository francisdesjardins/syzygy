import { expect, test as base } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The CT `test`, carrying two automatic fixtures — coverage and a guard on uncaught page errors —
 * and one override. `auto: true` applies the two unasked; the price is every CT file importing
 * `test` from here, which `ct-test-wiring.test.ts` holds.
 */

declare global {
  var __coverage__: Record<string, unknown> | undefined;
}

const OUTPUT_DIR = resolve(import.meta.dirname, '../../.nyc_output');

let written = 0;

/**
 * The two ways a page reload shows up in the fixture that was mid-navigation when it happened.
 *
 * Both are the reload itself rather than anything a dialog did, which is why they are matched by
 * text: Playwright raises a plain `Error` for the first and the driver raises the second.
 */
const RELOAD_RACE = /does not define window\.mount|Execution context was destroyed/;

export const test = base.extend<{ coverage: void; uncaught: void }>({
  /**
   * Playwright's own `mount`, retried when Vite reloaded the page out from under it.
   *
   * Discovering a dependency mid-session re-runs the optimizer and reloads the page —
   * `playground/vite.config.ts` says so over its `optimizeDeps.include`. A component test lazily
   * imports one story, so that lands on whichever test first reaches a name the list does not
   * carry: intermittent, and a different test each time. `include` cannot close it, since a new
   * harness may always import something new. corona's `openStory` retries its own door for this.
   */
  mount: async ({ mount }, use) => {
    // oxlint-disable-next-line react-hooks/rules-of-hooks -- Playwright's fixture callback, not React's `use` hook: the rule matches on the name alone
    await use(async (storyId, props) => {
      for (let attempt = 0; ; attempt += 1) {
        try {
          return await mount(storyId, props);
        } catch (error: unknown) {
          if (attempt >= 2 || !RELOAD_RACE.test(error instanceof Error ? error.message : '')) {
            throw error;
          }
        }
      }
    });
  },
  /**
   * An exception nothing in the page catches fails the test that provoked it. A spec asserts what it
   * looks at, so one thrown *after* the work it measures is done leaves every assertion green — and
   * `pageerror` carries an unhandled rejection as well, on all three engines. No opt-out: a test
   * that wants an exception catches it in the page and asserts on what it caught.
   */
  uncaught: [
    async ({ page }, use) => {
      const thrown: string[] = [];
      const record = (error: Error) => {
        // The stack, so a red in CI names the file rather than only the sentence.
        thrown.push(error.stack ?? error.message);
      };
      page.on('pageerror', record);

      await use();
      // The page outlives the test under `reuseContext`, so its listener must not.
      page.off('pageerror', record);

      expect(
        thrown,
        'The page threw, and nothing in it caught this — see src/__tests__/ct-test.ts'
      ).toEqual([]);
    },
    { auto: true },
  ],
  /**
   * A CT subject runs in the browser, so c8 has no Node process:
   * gnomon's instrumenter instruments the source into the bundle, counters land on
   * `window.__coverage__` in that page, and this reads them back before the page closes, writing one
   * file per test to `.nyc_output/` for the report step to merge. Inert without `CT_COVERAGE=1`.
   * Counters carry *source* line numbers, which that plugin exists to arrange: read its note before
   * swapping in `vite-plugin-istanbul` — right totals, wrong lines. `.nyc_output/` is emptied per
   * run by gnomon's reset step, since a file outliving its run merges into the next
   * report.
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
