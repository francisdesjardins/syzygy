import { expect, test } from './ct-test.js';
import type { StoryId } from './ct-test.js';

/**
 * What the bindings do at their edges, rather than in the middle.
 *
 * Both claims here are only provable in a browser: one needs a real renderer's context to be
 * absent, the other needs a real unmount to run the teardown. Neither is reachable from Node, which
 * is why `.c8rc.json` leaves `src/react/**` and `src/solid/**` to this project.
 *
 * Both bindings in one file, as in `binding-behaviour.ct.ts`: writing it twice is how the two
 * halves drift apart one assertion at a time.
 */

const BINDINGS = [
  { name: 'react', story: 'react-no-provider' },
  { name: 'solid', story: 'solid-no-provider' },
] as const satisfies readonly { name: string; story: StoryId }[];

test.describe('a binding reaching for the snapshot with no provider above it', () => {
  for (const binding of BINDINGS) {
    test(`${binding.name}: says so instead of pretending the run is still going`, async ({
      openStory,
      page,
    }) => {
      await openStory(binding.story);

      // The message matters, not just the throw: a blank snapshot would leave an app looking like
      // one whose bootstrap never finished, and that is the mistake this error exists to prevent.
      await expect(page.getByTestId('outcome')).toHaveText(
        'useBootstrapContext was called outside a <BootstrapProvider>.'
      );
    });
  }
});

test.describe('unmounting a mounted binding', () => {
  for (const binding of [
    'react-bootstrap',
    'solid-bootstrap',
  ] as const satisfies readonly StoryId[]) {
    test(`${binding}: tears the intent host down and lets the story go`, async ({
      openStory,
      page,
    }) => {
      await openStory(binding);
      await expect(page.getByTestId('stage')).toHaveText('settled');

      await page.evaluate(async () => {
        await window.unmount();
      });

      // The teardown is what is being measured — the host's `destroy` and the store's unsubscribe
      // both hang off it, and neither runs unless something really unmounts.
      await expect(page.getByTestId('stage')).toHaveCount(0);
    });
  }
});
