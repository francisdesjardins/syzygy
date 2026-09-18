/** Which scope the frame boots under. */
export type DemoScope = 'shared' | 'instance';

/**
 * What the frame is dealing with, beside its scope.
 *
 * Each is a condition rather than a fault: a page with no session, a build that is not a preview,
 * a service that stopped answering. What the demo is about is the ending each one produces being
 * the *same* ending for every module that shared the step.
 */
export type DemoConditions = {
  session: 'active' | 'none';
  preview: 'on' | 'off';
  access: 'ok' | 'hang';
};

export type DemoSearch = DemoConditions & { scope: DemoScope };

/**
 * The one reader of the frame's settings, used by the route to validate them and by the page to
 * read them back.
 *
 * Both sides going through the same function is what keeps them honest: an unrecognised value
 * resolves to the same default for the validator and for the toggle at once, rather than to the
 * default in one and `undefined` in the other.
 *
 * They live in the address rather than in component state because the frame carries links of its
 * own — right beside the numbers they change — and two controls for one setting disagree the moment
 * either is used.
 */
export function readDemoSearch(search: Record<string, unknown>): DemoSearch {
  return {
    scope: search['scope'] === 'instance' ? 'instance' : 'shared',
    session: search['session'] === 'none' ? 'none' : 'active',
    preview: search['preview'] === 'on' ? 'on' : 'off',
    access: search['access'] === 'hang' ? 'hang' : 'ok',
  };
}
