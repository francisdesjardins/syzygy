import { expect, test } from '@playwright/test';
import { isOnSite } from '../on-site.js';

/**
 * Whether a build is one surface of the site or the whole of what a reader can see.
 *
 * It decides whether the drawer offers a way out, so both answers are load-bearing: a false
 * positive puts links to `/` and to sibling playgrounds on a build served alone, where all three
 * are dead. It reads `window.location` rather than a flag, so the way to test it is to give it a
 * `window` — and the no-`window` case is the one a server-side render hits.
 */

const withPathname = <T>(pathname: string | undefined, body: () => T): T => {
  const had = 'window' in globalThis;
  const previous = (globalThis as { window?: unknown }).window;

  if (pathname === undefined) {
    delete (globalThis as { window?: unknown }).window;
  } else {
    (globalThis as { window?: unknown }).window = { location: { pathname } };
  }

  try {
    return body();
  } finally {
    // Restored rather than deleted: another test file sharing this worker would otherwise inherit
    // whichever window the last case left behind.
    if (had) {
      (globalThis as { window?: unknown }).window = previous;
    } else {
      delete (globalThis as { window?: unknown }).window;
    }
  }
};

test('no window at all is not the site — a render with no document links nowhere', () => {
  expect(withPathname(undefined, isOnSite)).toBe(false);
});

test('served under its capability path, it is one surface of the site', () => {
  expect(withPathname('/playground/dialog/', isOnSite)).toBe(true);
  expect(withPathname('/playground/boot/getting-started', isOnSite)).toBe(true);
  expect(withPathname('/playground/design/skin', isOnSite)).toBe(true);
});

test('served at its own root, it is the whole of what a reader can see', () => {
  expect(withPathname('/', isOnSite)).toBe(false);
  expect(withPathname('/getting-started', isOnSite)).toBe(false);
});

test('a path that merely starts like one is still not it', () => {
  // `/playgrounds-of-my-youth` starts with the same eleven characters and is somebody else's page.
  expect(withPathname('/playgrounds-of-my-youth', isOnSite)).toBe(false);
});
