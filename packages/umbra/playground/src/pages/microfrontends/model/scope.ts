/** Which scope the frame boots under. */
export type DemoScope = 'shared' | 'instance';

/**
 * The one reader of `?scope`, used by the route to validate it and by the page to read it back.
 *
 * Both sides going through the same function is what keeps them honest: a third value in the
 * address resolves to `page` for the validator and for the toggle at once, rather than to `page`
 * in one and `undefined` in the other.
 */
export function readScope(search: Record<string, unknown>): { scope: DemoScope } {
  return { scope: search['scope'] === 'instance' ? 'instance' : 'shared' };
}
