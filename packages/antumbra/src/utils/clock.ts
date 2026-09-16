/**
 * The two readings the timeline needs, behind one seam.
 *
 * They are different clocks and not one with two formats. `wall` is what correlates a run with the
 * server logs beside it; `elapsed` is monotonic, so a duration stays a duration when the machine
 * adjusts its time mid-run. Injectable because a test that asserts on a duration and reads the real
 * clock is a test that will fail on a slow morning.
 */
export type Clock = {
  readonly wall: () => number;
  readonly elapsed: () => number;
};

/**
 * The real clocks. Anything that measures a duration takes a {@link Clock} so a test can lie.
 *
 * @example
 * // The default, named here because a test passes a fake one instead and the two have to
 * // be the same shape.
 * const boot = createBootstrap({ steps, clock: systemClock });
 */
export const systemClock: Clock = {
  wall: () => {
    return Date.now();
  },
  elapsed: () => {
    return performance.now();
  },
};
