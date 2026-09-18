import { expect, test } from '../../__tests__/ct-test.js';

// A keyframed exit fires no `transitionend`, so its end is the animation's own. The harness sets
// `exitDuration` to 120 against 400 ms of keyframes, so only the right clock passes.

test.describe('an exit animated with @keyframes', () => {
  test('is waited for to its own end rather than cut by the exit-duration hint', async ({
    mount,
    page,
  }) => {
    await mount('KeyframedExitHarness');
    await page.getByTestId('open').click();
    await expect(page.getByTestId('visible')).toHaveText('yes');

    await page.getByTestId('close').click();
    await expect(page.getByTestId('elapsed')).not.toHaveText('', { timeout: 5_000 });

    const elapsed = Number(await page.getByTestId('elapsed').textContent());

    // The timer would have settled it at 170. The animation ends at 400. Anything under 300 means
    // the hint won, which is the defect this covers.
    expect(elapsed).toBeGreaterThan(300);
    // And it does not hang: the animation is 400 ms and the backstop sits just past it.
    expect(elapsed).toBeLessThan(1_200);
  });

  test('still ends, so a close is never left pending on an animation nobody watches', async ({
    mount,
    page,
  }) => {
    await mount('KeyframedExitHarness');
    await page.getByTestId('open').click();
    await expect(page.getByTestId('visible')).toHaveText('yes');

    await page.getByTestId('close').click();

    // `isVisible` is the library's own answer, and it is what a caller renders on.
    await expect(page.getByTestId('visible')).toHaveText('no', { timeout: 5_000 });
  });
});
