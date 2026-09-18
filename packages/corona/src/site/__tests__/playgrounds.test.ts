import { expect, test } from '@playwright/test';
import { PLAYGROUNDS, SITE } from '../playgrounds.js';

/**
 * The table every playground's drawer reads to link to the other two.
 *
 * It is data rather than logic, so what is worth asserting is the shape the drawer depends on: a
 * slug that repeats would render two entries pointing at one build, and a slug that drifts from
 * `deploy.mjs` would render a link to nothing. The root's `check:capabilities` holds the second
 * half; this holds the first, which no gate was watching.
 */

test('there are three playgrounds, and the drawer shows two of them from any one', () => {
  expect(PLAYGROUNDS).toHaveLength(3);
});

test('no slug repeats, or one build would be linked twice and another not at all', () => {
  const slugs = PLAYGROUNDS.map((playground) => {
    return playground.slug;
  });

  expect(new Set(slugs).size).toBe(slugs.length);
});

test('no name repeats either, since the name is what a reader picks between', () => {
  const names = PLAYGROUNDS.map((playground) => {
    return playground.name;
  });

  expect(new Set(names).size).toBe(names.length);
});

test('a slug is a capability, so none of them is a package name', () => {
  // The distinction the module's own doc comment rests on: `deploy.mjs` serves these paths
  // "whatever the packages end up being called", and a slug that had quietly become a package name
  // would be a URL about to break on the next rename.
  const names = PLAYGROUNDS.map((playground) => {
    return playground.name.toLowerCase();
  });

  for (const playground of PLAYGROUNDS) {
    expect(names).not.toContain(playground.slug.toLowerCase());
  }
});

test('every slug is URL-safe, because it is spelled straight into a path', () => {
  for (const playground of PLAYGROUNDS) {
    expect(playground.slug).toMatch(/^[a-z][a-z0-9-]*$/);
  }
});

test('the site is the way out, and it is the root', () => {
  expect(SITE.href).toBe('/');
  expect(SITE.name).not.toBe('');
});
