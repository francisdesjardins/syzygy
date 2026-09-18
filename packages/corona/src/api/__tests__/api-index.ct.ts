import { expect, test } from '../../__tests__/ct-test.js';

/**
 * The only symbol-to-route mapping, and the rule that makes it worth having one.
 *
 * A symbol's identity is `specifier#name`. The fixture has three `useDialog` declarations for that
 * reason: on a bare name the lookup shows one binding's signature under another's specifier, and
 * nothing goes red — the page simply documents the wrong thing.
 */

test('a name shared by three specifiers is three symbols, each with its own key', async ({
  page,
  openStory,
}) => {
  await openStory('ApiIndexReadout');

  await expect(page.getByTestId('collisions')).toHaveText(
    'lib#useDialog lib/react#useDialog lib/solid#useDialog'
  );
});

test('the same name resolves per specifier, and per key', async ({ page, openStory }) => {
  await openStory('ApiIndexReadout');

  // Asked by specifier and name, for a caller holding no key.
  await expect(page.getByTestId('by-specifier')).toHaveText('lib/react#useDialog');

  // Asked by key, which is what a cross-reference carries. The summary proves it found the Solid
  // declaration rather than whichever one the generator happened to walk first.
  await expect(page.getByTestId('by-key')).toHaveText('The Solid one.');
});

test('a URL is built in one place, and the anchor stays the bare name', async ({
  page,
  openStory,
}) => {
  await openStory('ApiIndexReadout');

  await expect(page.getByTestId('href')).toHaveText('/api/react');
  // One specifier per category, so the bare name is unique on its page — and it is what a reader
  // can guess and share.
  await expect(page.getByTestId('anchor')).toHaveText('api-useDialog');
});

test('neighbours are the reading order, and the ends have none', async ({ page, openStory }) => {
  await openStory('ApiIndexReadout');

  await expect(page.getByTestId('previous')).toHaveText('core');
  await expect(page.getByTestId('next')).toHaveText('solid');

  // The "next page" links at the end of a chapter: the first has no previous, the last no next.
  await expect(page.getByTestId('first-previous')).toHaveText('(none)');
  await expect(page.getByTestId('last-next')).toHaveText('(none)');
});

test('a lookup that misses answers nothing rather than guessing', async ({ page, openStory }) => {
  await openStory('ApiIndexReadout');

  await expect(page.getByTestId('unknown-category')).toHaveText('(none)');
  await expect(page.getByTestId('unknown-key')).toHaveText('(none)');
});

test('the entry points are derived from the categories, in reading order', async ({
  page,
  openStory,
}) => {
  await openStory('ApiIndexReadout');

  await expect(page.getByTestId('specifiers')).toHaveText('lib lib/react lib/solid');
  await expect(page.getByTestId('categories')).toHaveText('core react solid');
  await expect(page.getByTestId('categories-for')).toHaveText('core');
});

test('search reads names, and an empty query is not a search', async ({ page, openStory }) => {
  await openStory('ApiIndexReadout');

  // Whitespace is nothing asked, so nothing is returned — not every symbol.
  await expect(page.getByTestId('empty-search')).toHaveText('0');

  // Summaries are deliberately out of scope: searching them returns half of ninety for "dialog".
  await expect(page.getByTestId('summary-not-searched')).toHaveText('0');
});
