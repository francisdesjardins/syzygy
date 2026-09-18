import { expect, test } from '../../__tests__/ct-test.js';

/**
 * The token table, and the one claim that makes it worth generating rather than writing.
 *
 * It is a *view* of the stylesheet. A page that restated its own values would be right the day it
 * was written and wrong the first time one of them changed, with nothing to say so — so what these
 * assert is that the printed value comes off the live document, and that it follows the scheme.
 */

test('the printed value is the document’s, not a restated copy', async ({ page, openStory }) => {
  await openStory('TokenSwatchesBasic');

  // What the document actually resolves the name to, asked of the document rather than of the page.
  const resolved = await page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--app-flame').trim();
  });
  expect(resolved).not.toBe('');

  await expect(page.getByText(resolved, { exact: true }).first()).toBeVisible();
});

test('a name the document does not declare prints as empty rather than as a guess', async ({
  page,
  openStory,
}) => {
  await openStory('TokenSwatchesBasic');

  // The row still renders — a missing token is a fact about the sheet, and hiding it would make the
  // table quietly shorter than the list it was handed.
  await expect(page.getByText('--app-not-a-token', { exact: true })).toBeVisible();
  await expect(page.getByText('Declared by nobody', { exact: true })).toBeVisible();
});

test('the chip is painted by the name, so the page cannot claim a colour the sheet lacks', async ({
  page,
  openStory,
}) => {
  await openStory('TokenSwatchesBasic');

  // `background: var(--app-flame)` rather than the printed string: the two would have to disagree
  // visibly for the mistake to exist at all.
  const painted = await page.evaluate(() => {
    const chip = document.querySelector('[style*="--app-flame"]');
    return chip === null ? null : getComputedStyle(chip).backgroundColor;
  });
  expect(painted).not.toBeNull();
  expect(painted).not.toBe('rgba(0, 0, 0, 0)');
});

test('the value follows the scheme, even when the attribute is written late', async ({
  page,
  openStory,
}) => {
  await openStory('TokenSwatchesLateScheme');

  const light = await page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--app-flame').trim();
  });
  await expect(page.getByText(light, { exact: true }).first()).toBeVisible();

  await page.getByTestId('flip').click();

  const dark = await page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--app-flame').trim();
  });
  // The gallery's skin declares a different flame in each scheme; equal values would mean the flip
  // never reached the document and this test proves nothing.
  expect(dark).not.toBe(light);

  // The defect this guards: a table keyed on React's idea of the scheme keeps the outgoing values,
  // because the provider's effect runs after its descendants'. This one watches the attribute.
  await expect(page.getByText(dark, { exact: true }).first()).toBeVisible();
  await expect(page.getByText(light, { exact: true })).toHaveCount(0);
});
