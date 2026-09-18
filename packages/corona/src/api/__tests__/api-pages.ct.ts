import { expect, test } from '../../__tests__/ct-test.js';

/**
 * The reference pages, rendered through a host that is not either playground.
 *
 * That is the claim worth testing: the viewer owns the page and borrows every component in it, so a
 * harness lending plain marked stand-ins proves the borrowing rather than reproducing a playground.
 * A viewer that reached for its own card or its own button would fail here and nowhere else.
 */

test('the index renders through the host, not through components of its own', async ({
  page,
  openStory,
}) => {
  await openStory('ApiIndex');

  // Every one of these is the harness's, marked. The viewer never draws a layout or a card.
  await expect(page.getByTestId('slot-page-layout')).toBeVisible();
  await expect(page.getByTestId('slot-section').first()).toBeVisible();
  await expect(page.getByTestId('slot-grid').first()).toBeVisible();
  await expect(page.getByTestId('slot-card').first()).toBeVisible();
});

test('the index leads with the library’s own entry points', async ({ page, openStory }) => {
  await openStory('ApiIndex');

  // The blurbs and labels are the only library-specific data the viewer holds, and they come from
  // the host rather than from the model.
  await expect(page.getByText('Core', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('React binding', { exact: true }).first()).toBeVisible();
});

test('a card per category, each linking at the one place a URL is built', async ({
  page,
  openStory,
}) => {
  await openStory('ApiIndex');

  // Three categories in the fixture, three chapter links — `/api/<id>`, which is `categoryHref`.
  for (const id of ['core', 'react', 'solid']) {
    await expect(page.locator(`a[href="/api/${id}"]`).first()).toBeVisible();
  }
});

test('a chapter names its specifier and counts its exports', async ({ page, openStory }) => {
  await openStory('ApiChapterMiddle');

  // The specifier rides in `actions`, which the host places — the viewer only says what goes there.
  await expect(page.getByTestId('page-actions')).toHaveText('lib/react');
  await expect(page.getByText('1 exports')).toBeVisible();
});

test('the import line is the one you would paste, and it skips the types', async ({
  page,
  openStory,
}) => {
  await openStory('ApiChapterFirst');

  // The core fixture exports two values and one type. The line names the values — a `Thing` in a
  // plain `import` is a line that does not compile, which is the opposite of pasteable.
  await expect(page.getByText("import { createThing, useDialog } from 'lib';")).toBeVisible();
});

test("an example is shown through the host's code block", async ({ page, openStory }) => {
  await openStory('ApiChapterFirst');

  // The examples are the one place the viewer borrows highlighting: each host highlights its own
  // way, and the reference only ever shows TSX.
  await expect(page.getByTestId('slot-code').first()).toHaveText('const thing = createThing();');
});

test('the pager offers the neighbours, and the first chapter has no previous', async ({
  page,
  openStory,
}) => {
  await openStory('ApiChapterMiddle');
  await expect(page.getByTestId('icon-back')).toBeVisible();
  await expect(page.getByTestId('icon-forward')).toBeVisible();

  await openStory('ApiChapterFirst');
  await expect(page.getByTestId('icon-back')).toHaveCount(0);
  await expect(page.getByTestId('icon-forward')).toBeVisible();
});

test('a category nobody generated says so and offers the way back', async ({ page, openStory }) => {
  await openStory('ApiChapterMissing');

  // A URL a reader kept after a rename. Blank would be the failure that reaches a reader first.
  await expect(page.getByRole('heading', { name: 'Not in the reference' })).toBeVisible();
  await expect(page.getByTestId('page-description')).toContainText('ghosts');
  await expect(page.getByRole('link', { name: 'Back to the API reference' })).toBeVisible();
});

test('search finds a symbol by name and shows which specifier it belongs to', async ({
  page,
  openStory,
}) => {
  await openStory('ApiSearch');

  const box = page.getByRole('searchbox').or(page.getByPlaceholder('Search the reference'));
  await box.fill('createThing');

  await expect(page.getByText('createThing').first()).toBeVisible();
});

test('a name three specifiers share returns three results, not one', async ({
  page,
  openStory,
}) => {
  await openStory('ApiSearch');

  const box = page.getByRole('searchbox').or(page.getByPlaceholder('Search the reference'));
  await box.fill('useDialog');

  // The whole reason a symbol's identity is `specifier#name`: a bare-name index would show one.
  await expect(page.locator('a[href*="api-useDialog"]')).toHaveCount(3);
});
