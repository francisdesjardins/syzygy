import { createBootstrap, defineStep } from 'umbra';

/**
 * A branch the app is meant to run without, and what it starts when it does fire.
 *
 * The rest of this page shows one graph the author knew in advance. This is the other half of the
 * model: a plugin host that may simply not be installed, so its whole branch is `optional` — and
 * what the branch discovers is a tier that is **required**, because a module loaded halfway is
 * worse than a module absent.
 *
 * Optional upstream, required downstream, and neither one a compromise.
 */

export type Manifest = { readonly modules: readonly string[] };

/**
 * Tier one. Only `plugin-host` carries the flag; `plugin-manifest` inherits it by depending on it,
 * because a step runs only when every one of its needs succeeded.
 */
export function tierOne(hostAnswers: boolean) {
  return createBootstrap({
    steps: [
      // The same two ids the rest of this page declares, so the registry types them here too —
      // this is the same application, booting the same way, with one branch added.
      defineStep({
        id: 'session',
        run: async () => {
          await pause(120);
          return { userId: 'u-1', displayName: 'Ada', expiresAt: 0 };
        },
      }),
      defineStep({
        id: 'config',
        needs: ['session'],
        run: async () => {
          await pause(90);
          return { workspaceName: 'Atelier', trialDaysLeft: 12 };
        },
      }),
      defineStep({
        id: 'plugin-host',
        needs: ['session'],
        optional: true,
        run: async () => {
          await pause(140);
          if (!hostAnswers) {
            throw new Error('no plugin host on this install');
          }
          return { modules: ['billing', 'reports'] };
        },
      }),
      defineStep({
        id: 'plugin-manifest',
        needs: ['plugin-host'],
        run: (ctx): Manifest => {
          return { modules: (ctx.get('plugin-host') as Manifest).modules };
        },
      }),
    ],
  });
}

/**
 * Tier two, declared from what tier one found. Nothing here is optional, and `billing` refuses.
 *
 * The ids did not exist when this file was written and no registry names them, which is what lets a
 * graph be built from data.
 */
export function tierTwo(modules: readonly string[]) {
  return createBootstrap({
    steps: modules.flatMap((name) => {
      return [
        defineStep({
          id: `${name}:schema`,
          run: async () => {
            await pause(70);
            return { name };
          },
        }),
        defineStep({
          id: `${name}:grants`,
          needs: [`${name}:schema`],
          run: async (ctx) => {
            await pause(60);
            if (name === 'billing') {
              return ctx.block('billing needs a grant this user does not have');
            }
            return { ok: true };
          },
        }),
      ];
    }),
  });
}

/** Long enough that the two columns are visibly two columns, short enough that nobody waits. */
function pause(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
