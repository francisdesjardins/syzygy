import { expect, test } from '../../__tests__/ct-test.js';

/**
 * The playgrounds' easter egg, and the two claims that are not about the joke.
 *
 * It draws nothing — the host passes the moon in, which is what lets one copy serve three
 * playgrounds — and it is dismissible without a pointer, because a thing that flees the pointer
 * cannot be dismissed only by one.
 *
 * It arrives on a random delay of 1.5–3s, so every test here waits for it rather than assuming a
 * frame. That is the component's timing, not the harness's.
 */

test('it draws nothing: the moon on screen is the one the host passed', async ({
  page,
  openStory,
}) => {
  await openStory('PeekingMoonBasic');

  const mascot = page.getByRole('button', { name: 'Dismiss the mascot' });
  await expect(mascot).toBeVisible({ timeout: 10_000 });

  // The host's drawing, inside the mascot's box. Were the drawing this component's, the three
  // playgrounds could not each have their own.
  await expect(mascot.getByTestId('face')).toBeVisible();
});

test('it is a named control, reachable and dismissible by keyboard', async ({
  page,
  openStory,
}) => {
  await openStory('PeekingMoonBasic');

  const mascot = page.getByRole('button', { name: 'Dismiss the mascot' });
  await expect(mascot).toBeVisible({ timeout: 10_000 });

  // A pointer is exactly what it runs away from, so the keyboard has to work: focus it and press
  // Enter. `tabIndex` is what makes that possible at all.
  await mascot.focus();
  await page.keyboard.press('Enter');

  // The eclipse plays for under a second, then it is gone for the session.
  await expect(mascot).toHaveCount(0, { timeout: 10_000 });
});

test('space dismisses it too, and does not scroll the page', async ({ page, openStory }) => {
  await openStory('PeekingMoonBasic');

  const mascot = page.getByRole('button', { name: 'Dismiss the mascot' });
  await expect(mascot).toBeVisible({ timeout: 10_000 });

  await mascot.focus();
  await page.keyboard.press(' ');

  await expect(mascot).toHaveCount(0, { timeout: 10_000 });
});

test('dismissed is for good — it does not come back', async ({ page, openStory }) => {
  await openStory('PeekingMoonBasic');

  const mascot = page.getByRole('button', { name: 'Dismiss the mascot' });
  await expect(mascot).toBeVisible({ timeout: 10_000 });
  // Dispatched on the node rather than aimed at coordinates: the peek animation runs for two
  // minutes, so the element has moved by the time a positioned click lands, and Playwright's
  // stability wait can never settle either. The event is what this asserts, not the aim.
  await mascot.dispatchEvent('click');
  await expect(mascot).toHaveCount(0, { timeout: 10_000 });

  // The soonest a startled one returns is six seconds; a dismissed one never schedules at all.
  await page.waitForTimeout(7_000);
  await expect(mascot).toHaveCount(0);
});

test('it resizes with the viewport rather than keeping its first size', async ({
  page,
  openStory,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await openStory('PeekingMoonBasic');

  const mascot = page.getByRole('button', { name: 'Dismiss the mascot' });
  await expect(mascot).toBeVisible({ timeout: 10_000 });
  const wide = (await mascot.boundingBox())?.width ?? 0;

  // Below 480 the moon is 120 rather than 180: a phone gets less of the reading column taken.
  await page.setViewportSize({ width: 420, height: 800 });
  await page.waitForTimeout(400);
  const narrow = (await mascot.boundingBox())?.width ?? 0;

  expect(narrow).toBeLessThan(wide);
});

test('a click reaches it as a click, not only as a disappearance', async ({ page, openStory }) => {
  await openStory('PeekingMoonShy');

  const mascot = page.getByRole('button', { name: 'Dismiss the mascot' });
  await expect(mascot).toBeVisible({ timeout: 10_000 });
  await mascot.dispatchEvent('click');

  // The bystander records the event bubbling out of it. Without this a mascot that merely stopped
  // rendering would pass the test above.
  await expect(page.getByTestId('dismissed')).toHaveText('yes');
});
