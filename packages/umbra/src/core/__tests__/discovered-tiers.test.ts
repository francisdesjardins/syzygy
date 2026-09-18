import { expect, test } from '@playwright/test';
import { createBootstrap } from '../create-bootstrap.js';
import { defineStep } from '../define-step.js';
import { clearSharedScope } from '../shared-scope.js';

/**
 * Bootstrapping something whose shape is only known once it has started talking.
 *
 * The rest of this suite declares a graph the author knew in advance. This file covers the case
 * that looks, at first, like it needs a feature this package refuses to add: a robot whose arm is
 * assembled from whatever the base reports at power-on — seven axes or four, a gripper, a camera,
 * both, neither. No process running this can write `steps` ahead of time.
 *
 * **The answer is one bootstrap per tier, not a bootstrap that grows.** `createBootstrap` compiles
 * the graph once and `plan()` is that compilation handed back; a step added mid-run would make the
 * plan a description of something that did not happen, which is the one promise the planner makes.
 * So a tier that discovers the next one hands its outcome over, and the next `createBootstrap`
 * reads it. Every tier keeps the whole model — derived parallelism, refusals, timeouts, notices.
 *
 * This runs in Node, with no DOM and no framework, which is the second thing it is here to show.
 */

type Joint = { readonly id: string; readonly actuator: 'big' | 'small' };
type Tree = { readonly joints: readonly Joint[]; readonly endEffector: readonly string[] };

/** The tree the base reports once it is powered and has walked its own bus. */
const DISCOVERED: Tree = {
  joints: [
    { id: 'axis-1', actuator: 'big' },
    { id: 'axis-2', actuator: 'big' },
    { id: 'axis-3', actuator: 'big' },
    { id: 'axis-4', actuator: 'small' },
    { id: 'axis-5', actuator: 'small' },
    { id: 'axis-6', actuator: 'small' },
    { id: 'axis-7', actuator: 'small' },
  ],
  endEffector: ['gripper', 'camera'],
};

test.beforeEach(() => {
  clearSharedScope();
});

test('a discovered tree becomes the next tier, and the plan still describes the run', async () => {
  const calls: string[] = [];

  // Tier one: what is true of every robot, whatever it turns out to be made of.
  const base = createBootstrap({
    steps: [
      defineStep({
        id: 'bus',
        timeout: 2000,
        run: () => {
          calls.push('bus');
          return { baudRate: 1_000_000 };
        },
      }),
      defineStep({
        id: 'base-config',
        needs: ['bus'],
        run: () => {
          calls.push('base-config');
          return { serial: 'RX-7', firmware: '4.2.0' };
        },
      }),
      defineStep({
        id: 'tree',
        needs: ['bus'],
        run: (): Tree => {
          calls.push('tree');
          return DISCOVERED;
        },
      }),
    ],
  });

  const powered = await base.run();
  expect(powered.status).toBe('ready');

  // `base-config` and `tree` both need only `bus`, so the planner put them on one level.
  expect(
    base.plan().levels.map((level) => {
      return level.ids;
    })
  ).toEqual([['bus'], ['base-config', 'tree']]);

  const tree = powered.data['tree'] as Tree;

  // Tier two, declared from the answer. The ids did not exist when this file was written, and no
  // registry names them — an id a registry does not name is still a legal id, which is what lets a
  // graph be built from data.
  const arm = createBootstrap({
    steps: [
      ...tree.joints.map((joint) => {
        return defineStep({
          id: `joint:${joint.id}`,
          run: () => {
            calls.push(`joint:${joint.id}`);
            return { homed: true, actuator: joint.actuator };
          },
        });
      }),
      defineStep({
        id: 'end-effector',
        // Every joint, by name. The snake has to be up before the thing on the end of it.
        needs: tree.joints.map((joint) => {
          return `joint:${joint.id}`;
        }),
        run: () => {
          calls.push('end-effector');
          return { attachments: tree.endEffector };
        },
      }),
    ],
  });

  const assembled = await arm.run();
  expect(assembled.status).toBe('ready');

  // Seven joints on one level because none of them needs another, then the end effector alone.
  const levels = arm.plan().levels;
  expect(levels).toHaveLength(2);
  expect(levels[0]?.ids).toHaveLength(7);
  expect(levels[1]?.ids).toEqual(['end-effector']);

  // The seven went out together; the end effector waited for all of them.
  expect(calls.indexOf('end-effector')).toBe(calls.length - 1);
  expect(assembled.data['end-effector']).toEqual({ attachments: ['gripper', 'camera'] });
});

test('a tier that cannot describe itself refuses, and the next tier is never built', async () => {
  const base = createBootstrap({
    steps: [
      defineStep({
        id: 'bus',
        run: (ctx) => {
          // A bus that answers nothing is not a degraded robot, it is a robot that must not move.
          return ctx.block('No answer on the bus.');
        },
      }),
      defineStep({
        id: 'tree',
        needs: ['bus'],
        run: () => {
          return DISCOVERED;
        },
      }),
    ],
  });

  const powered = await base.run();

  // Narrowed rather than asserted: `blockedBy` lives on the non-`ready` half of the outcome union,
  // so reading it is only legal once the type knows which half this is. An `expect` does not narrow.
  if (powered.status === 'ready') {
    throw new Error('Expected the bus to refuse.');
  }

  expect(powered.status).toBe('blocked');
  expect(powered.blockedBy?.step).toBe('bus');
  expect(powered.data['tree']).toBeUndefined();

  // The refusal is a decision, not a crash: nothing is reported as an error.
  expect(powered.errors).toEqual([]);
});

/**
 * The other shape of a discovered tier: one that may turn out not to exist at all.
 *
 * The robot above always has an arm. A plugin host may simply not be installed, and an app whose
 * boot fails over that is an app that cannot ship without the plugin — which is the opposite of
 * what optional means. So the branch is marked `optional`, and what it discovers is a tier that is
 * **required** once it exists, because a module loaded halfway is worse than a module absent.
 *
 * Optional upstream, required downstream, and neither one a compromise.
 */
type Manifest = { readonly modules: readonly string[] };

const pluginTier = (hostAnswers: boolean) => {
  return createBootstrap({
    steps: [
      defineStep({
        id: 'session',
        run: () => {
          return { userId: 'u-1' };
        },
      }),
      defineStep({
        id: 'config',
        needs: ['session'],
        run: () => {
          return { locale: 'fr-CA' };
        },
      }),
      defineStep({
        id: 'plugin-host',
        needs: ['session'],
        optional: true,
        run: () => {
          if (!hostAnswers) {
            throw new Error('no plugin host on this install');
          }
          return { modules: ['reports'] };
        },
      }),
      // Not declared optional, and it does not need to be: its need is, and a step only runs when
      // every one of its needs succeeded. Marking the root of a branch is what makes the branch
      // optional, all the way down.
      defineStep({
        id: 'plugin-manifest',
        needs: ['plugin-host'],
        run: (ctx): Manifest => {
          return { modules: (ctx.get('plugin-host') as Manifest).modules };
        },
      }),
    ],
  });
};

test('an absent optional branch prunes its whole subtree and still mounts', async () => {
  const outcome = await pluginTier(false).run();

  // Degraded, not failed: the app is meant to run without plugins.
  expect(outcome.status).toBe('degraded');
  expect(outcome.data['config']).toEqual({ locale: 'fr-CA' });

  const statusOf = (id: string) => {
    return outcome.timeline.find((trace) => {
      return trace.id === id;
    })?.status;
  };
  expect(statusOf('plugin-host')).toBe('failed');
  expect(statusOf('plugin-manifest')).toBe('skipped');

  // The distinction the whole flag exists for. A tolerated error is a fact about the install, and
  // the one thing that must not happen is it reading as a bug.
  expect(outcome.errors).toHaveLength(1);
  expect(outcome.errors[0]?.tolerated).toBe(true);
  expect(outcome.data['plugin-manifest']).toBeUndefined();
});

test('a fired optional branch starts a tier that is allowed to refuse', async () => {
  const first = await pluginTier(true).run();

  expect(first.status).toBe('ready');
  expect(first.data['plugin-manifest']).toEqual({ modules: ['reports'] });

  // Tier two, declared from what the optional branch found. Nothing here is optional: a module is
  // loaded completely or not at all, so these may block — which tier one could not have done about
  // plugins, their ids not existing when its graph was compiled.
  const modules = (first.data['plugin-manifest'] as Manifest).modules;
  const second = createBootstrap({
    steps: modules.flatMap((name: string) => {
      return [
        defineStep({
          id: `${name}:schema`,
          run: () => {
            return { name };
          },
        }),
        defineStep({
          id: `${name}:grants`,
          needs: [`${name}:schema`],
          run: (ctx) => {
            return ctx.block(`${name} needs a grant this user does not have`);
          },
        }),
      ];
    }),
  });

  const loaded = await second.run();

  if (loaded.status === 'ready') {
    throw new Error('Expected the module to refuse.');
  }

  // The asymmetry is the point: tier one answered "good enough to mount" and tier two answered
  // "this user may not have this module". Two questions, two runs, two independent answers.
  expect(loaded.status).toBe('blocked');
  expect(loaded.blockedBy?.step).toBe('reports:grants');
  expect(first.status).toBe('ready');

  // The step that decided says so, in the timeline, without anyone having to cross-reference
  // `blockedBy` — status and reason both, which is what separates it from the steps it stopped.
  const grants = loaded.timeline.find((trace) => {
    return trace.id === 'reports:grants';
  });
  expect(grants?.status).toBe('blocked');
  expect(grants?.reason).toBe('reports needs a grant this user does not have');

  // And a refusal is still not a failure: nothing to fix, so nothing in `errors`.
  expect(loaded.errors).toEqual([]);
});

test('a step stopped by someone else refusing is cancelled, not blocked', async () => {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'grant',
        run: (ctx) => {
          return ctx.block('no grant');
        },
      }),
      // Same level, so it is in flight when the refusal lands and is aborted mid-run. It decided
      // nothing, and the whole point of the two words is that it does not claim to have.
      defineStep({
        id: 'catalogue',
        run: async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 50);
          });
          return { items: 0 };
        },
      }),
    ],
  });

  const outcome = await boot.run();
  const statusOf = (id: string) => {
    return outcome.timeline.find((trace) => {
      return trace.id === id;
    })?.status;
  };

  expect(statusOf('grant')).toBe('blocked');
  expect(statusOf('catalogue')).toBe('cancelled');
  expect(outcome.errors).toEqual([]);
});
