import { expect, test } from '../../__tests__/ct-test.js';

/**
 * The shell's one button, and the recipe for the two elements that cannot be it.
 *
 * What is worth asserting is not the pixels — those are the skin's — but that each look reaches the
 * element, that the recipe produces the same list the component does, and that the spread is a
 * spread. The last one is the trap the component's own doc names: a wrapper enumerating props drops
 * `aria-*` and `data-*` silently, which is a feature that stops working with nothing going red.
 */

test('every variant reaches the element as its own class list', async ({ page, openStory }) => {
  await openStory('AppButtonLooks');

  const classOf = async (id: string) => {
    return (await page.getByTestId(id).getAttribute('class')) ?? '';
  };

  const contained = await classOf('contained');
  const outlined = await classOf('outlined');
  const text = await classOf('text');
  const containedError = await classOf('contained-error');

  // Four different looks, four different lists. Equal ones would mean the ternary collapsed.
  expect(new Set([contained, outlined, text, containedError]).size).toBe(4);

  // `text` is the default, so the bare button and the explicit one agree.
  expect(await classOf('default')).toBe(text);
});

test('size is a separate axis from variant', async ({ page, openStory }) => {
  await openStory('AppButtonLooks');

  const small = (await page.getByTestId('small').getAttribute('class')) ?? '';
  const medium = (await page.getByTestId('default').getAttribute('class')) ?? '';

  expect(small).not.toBe(medium);
});

test('an element that cannot be the component gets the same list from the recipe', async ({
  page,
  openStory,
}) => {
  await openStory('AppButtonLooks');
  const contained = (await page.getByTestId('contained').getAttribute('class')) ?? '';

  await openStory('AppButtonRecipe');
  const link = page.getByTestId('link');

  // The same look, and still a real anchor — a `<button>` here would cost new-tab and copy-link.
  expect(await link.getAttribute('class')).toBe(contained);
  expect(
    await link.evaluate((node) => {
      return node.tagName;
    })
  ).toBe('A');
  expect(await link.getAttribute('href')).toBe('/somewhere');
});

test('the props are spread, not enumerated', async ({ page, openStory }) => {
  await openStory('AppButtonSpread');
  const button = page.getByTestId('spread');

  // Three attributes a dialog action spreads onto its own button. A wrapper listing the props it
  // knows about drops these and the feature they carry goes quiet.
  await expect(button).toHaveAttribute('aria-keyshortcuts', 'Enter');
  await expect(button).toHaveAttribute('data-action-reason', 'confirm');
  await expect(button).toHaveAttribute('title', 'A title');
  await expect(button).toBeDisabled();
});

test('it is a button that submits nothing unless asked', async ({ page, openStory }) => {
  await openStory('AppButtonLooks');

  // `type` defaults to `button`: inside a form, the HTML default of `submit` would make every
  // shell control post the page.
  await expect(page.getByTestId('default')).toHaveAttribute('type', 'button');
});
