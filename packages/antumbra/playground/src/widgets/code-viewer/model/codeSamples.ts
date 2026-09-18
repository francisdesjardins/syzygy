/**
 * Which samples the viewer downloads, and when: hundreds of kB of source text, most of it for the
 * route that indexes things — `/ui-templates` — so one module fetched everything.
 * **Groups are cut by where a sample comes from, not how its key is spelled** — `vanilla-form` is a
 * `/ui-integrations` example, `vanilla-msg-title` a template. Add a `?raw` import to `examples.ts`
 * (a route's own) or `templates.ts` (`entities/dialog-template`, `shared/*`).
 */
const LOADERS = {
  examples: async () => {
    return (await import('./code-samples/examples')).examples;
  },
  templates: async () => {
    return (await import('./code-samples/templates')).templates;
  },
} as const;

type Group = keyof typeof LOADERS;

/** The route with its own samples; keyed by route so adding one need not edit an index here. */
const GROUP_FOR_ROUTE: Readonly<Record<string, Group>> = {
  '/ui-templates': 'templates',
};

/** From the route, then checked against the key so another group's sample still renders. */
export const loadCodeSamples = async (
  pathname: string,
  codeKey: string
): Promise<Record<string, string>> => {
  const preferred = GROUP_FOR_ROUTE[pathname] ?? 'examples';
  const samples = await LOADERS[preferred]();
  if (codeKey in samples) {
    return samples;
  }

  for (const [group, load] of Object.entries(LOADERS)) {
    if (group === preferred) {
      continue;
    }
    const other = await load();
    if (codeKey in other) {
      return other;
    }
  }

  return samples;
};
