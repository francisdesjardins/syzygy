import type { Page } from '@playwright/test';
import { expect, test } from './ct-test.js';

/**
 * One test file for both hook bindings, against one DOM contract.
 *
 * Writing it twice would let the two halves drift apart one assertion at a time, which is the exact
 * thing the bindings promise not to do. The stories render the same ids over the same scenario, so
 * a difference between React and Solid shows up here as a failure rather than as a surprise in
 * somebody's app.
 */
const BINDINGS = ['react', 'solid'] as const;

/**
 * Mounted through the gallery door rather than through the `/stories` route.
 *
 * The route renders inside the app — router, providers, layout, code dialog — and a harness that
 * carries all of that measures the app as much as the binding. The door imports the stories and
 * nothing else, so a failure here is the binding's.
 */
async function openStory(page: Page, binding: string): Promise<void> {
  await page.goto('/?gallery');
  await page.evaluate(async (story) => {
    await window.mount({ story });
  }, `${binding}-bootstrap`);
  await expect(page.getByTestId('stage')).toHaveText('settled');
}

for (const binding of BINDINGS) {
  test(`${binding}: the run settles and the data is readable`, async ({ page }) => {
    await openStory(page, binding);

    // Degraded rather than ready: the tags step is optional and fails on purpose, so this also
    // proves the status is being read rather than assumed.
    await expect(page.getByTestId('status')).toHaveText('degraded');
    await expect(page.getByTestId('config')).toHaveText('Story Workspace');
    await expect(page.getByTestId('notices')).toHaveText('1');
  });

  test(`${binding}: an intent is forwarded to the host and settling it releases the step`, async ({
    page,
  }) => {
    await openStory(page, binding);

    await expect(page.getByTestId('intent-status')).toHaveText('forwarded');
    await page.getByTestId('settle').click();
    await expect(page.getByTestId('intent-status')).toHaveText('handled');
  });

  test(`${binding}: dropping an intent records the reason instead of losing it`, async ({
    page,
  }) => {
    await openStory(page, binding);

    await page.getByTestId('drop').click();
    await expect(page.getByTestId('intent-status')).toHaveText('dropped');
  });
}

test('the two bindings render the same readout', async ({ page }) => {
  const readouts: string[][] = [];

  for (const binding of BINDINGS) {
    await openStory(page, binding);
    readouts.push(
      await Promise.all(
        ['stage', 'status', 'config', 'notices', 'intent-status'].map((id) => {
          return page.getByTestId(id).innerText();
        })
      )
    );
  }

  expect(readouts[0]).toEqual(readouts[1]);
});
