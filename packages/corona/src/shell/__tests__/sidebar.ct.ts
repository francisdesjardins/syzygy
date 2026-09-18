import { expect, test } from '../../__tests__/ct-test.js';

/**
 * The drawer every playground wears, and the rules it was written twice to get wrong.
 *
 * Each test here is a defect the component's own doc names: a way out that vanished off the site, a
 * neighbouring route lit by a bare `startsWith`, and a mobile drawer that closed itself the instant
 * it opened.
 */

test('the way out is the first group, and it names the other two playgrounds', async ({
  page,
  openStory,
}) => {
  await openStory('SidebarFromDialog');
  const elsewhere = page.getByRole('navigation', { name: 'Elsewhere' });

  // Seen from the dialog playground: the site, and the two siblings — never itself.
  await expect(elsewhere.getByText('Syzygy', { exact: true })).toBeVisible();
  await expect(elsewhere.getByText('Umbra', { exact: true })).toBeVisible();
  await expect(elsewhere.getByText('Penumbra', { exact: true })).toBeVisible();
  await expect(elsewhere.getByText('Antumbra', { exact: true })).toHaveCount(0);

  // First, not pinned under the rest: it is on the same grid as every group below it.
  const names = await page.getByRole('navigation').evaluateAll((nodes) => {
    return nodes.map((node) => {
      return node.getAttribute('aria-label');
    });
  });
  expect(names[0]).toBe('Elsewhere');
});

test('off the site the same rows render, as text rather than dead links', async ({
  page,
  openStory,
}) => {
  await openStory('SidebarWide');
  const elsewhere = page.getByRole('navigation', { name: 'Elsewhere' });

  // The gallery is served at `/`, so this is the off-site branch — which is also how a playground
  // is developed. A group that disappeared here would be invisible for the whole of the work that
  // changes it.
  await expect(elsewhere.getByText('Syzygy', { exact: true })).toBeVisible();
  await expect(elsewhere.getByRole('link')).toHaveCount(0);
});

test('a route a segment deeper still lights its item', async ({ page, openStory }) => {
  await openStory('SidebarDeepRoute');

  // `/api/tokens` is a chapter of `/api`, and the reader is still in the reference.
  await expect(page.getByRole('link', { name: 'API Reference' })).toHaveAttribute(
    'aria-current',
    'page'
  );
});

test('a route that merely starts the same does not', async ({ page, openStory }) => {
  await openStory('SidebarNeighbourRoute');

  // `/apiary` shares four characters with `/api` and is somebody else's page. A bare `startsWith`
  // lights both, which is the whole reason the check asks for a separator.
  await expect(page.getByRole('link', { name: 'API Reference' })).not.toHaveAttribute(
    'aria-current',
    'page'
  );
  await expect(page.getByRole('link', { name: 'Apiary' })).toHaveAttribute('aria-current', 'page');
});

test('the mobile drawer opens and stays open', async ({ page, openStory }) => {
  await openStory('SidebarMobile');

  await expect(page.getByTestId('state')).toHaveText('closed');
  await page.getByTestId('open').click();

  // The defect this guards closed it again in the same tick, because an effect depended on an
  // inline `onClose` whose identity changed on every render.
  await expect(page.getByTestId('state')).toHaveText('open');
  await page.waitForTimeout(150);
  await expect(page.getByTestId('state')).toHaveText('open');
});

test('escape closes it, and the backdrop is a real control', async ({ page, openStory }) => {
  await openStory('SidebarMobile');
  await page.getByTestId('open').click();
  await expect(page.getByTestId('state')).toHaveText('open');

  // A named button rather than a div with a handler: a div is unreachable by keyboard and has no
  // accessible name, and this is the click-outside.
  await expect(page.getByRole('button', { name: 'Close navigation' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByTestId('state')).toHaveText('closed');
});

test('the closed mobile panel is inert, so its links leave the tab order', async ({
  page,
  openStory,
}) => {
  await openStory('SidebarMobile');

  // `inert` rather than `aria-hidden`: hiding it from readers while leaving it tabbable is the
  // worse half of that bug.
  const panel = page.locator('aside');
  await expect(panel).toHaveAttribute('inert', '');

  await page.getByTestId('open').click();
  await expect(panel).not.toHaveAttribute('inert', '');
});
