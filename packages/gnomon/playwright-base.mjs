/**
 * The half of a Playwright config that is the same in every workspace.
 *
 * What differs between them is the interesting half — which projects exist, what a browser project
 * needs served, how many engines it runs on — and that stays in each `playwright.config.ts`. What
 * does not differ is the CI posture: fail on `.only`, retry twice, one worker, and a list reporter
 * beside the HTML one so a log is readable without opening a file. Four copies of that drifted into
 * four slightly different answers, and the one that mattered was `forbidOnly`.
 *
 * Timeouts are here for the same reason and are two numbers rather than one. A unit test runs in
 * Node with no page, so ten seconds means hung rather than slow. A component test shares the machine
 * with its siblings and Playwright's actionability wait is wall-clock, so its budget is contention
 * rather than behaviour — a green run never approaches it.
 */

export const UNIT_TIMEOUT = 10 * 1000;
export const COMPONENT_TIMEOUT = 30 * 1000;

/**
 * The shared config fields, ready to spread.
 *
 * Spread rather than merged by a helper, so a workspace overriding one of them does it in plain
 * sight: `{ ...playwrightBase(), workers: 1 }` reads as an exception, where a function taking an
 * options bag would hide it behind an argument name.
 *
 * @param {{ ci?: boolean }} [options]
 */
export function playwrightBase({ ci = Boolean(process.env['CI']) } = {}) {
  return {
    fullyParallel: true,
    forbidOnly: ci,
    retries: ci ? 2 : 0,
    workers: ci ? 1 : '50%',
    timeout: UNIT_TIMEOUT,
    reporter: ci
      ? [['list'], ['html', { outputFolder: 'playwright-report' }]]
      : [['html', { outputFolder: 'playwright-report' }]],
  };
}
