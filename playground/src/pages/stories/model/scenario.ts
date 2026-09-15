import { createBootstrap, defineMountedStep, defineStep } from 'antumbra';

/**
 * The one scenario both bindings' stories boot.
 *
 * Deterministic and shared on purpose: the component suite asserts that React and Solid produce the
 * same DOM, and that claim means nothing if each side booted something slightly different.
 *
 * It exercises the whole loop in five steps — a session, a required read off it, an optional read
 * that fails, a preflight step that queues a warning, and a mounted step that waits for the answer.
 */
export function createScenario() {
  const session = defineStep({
    id: 'session',
    run: () => {
      return { userId: 'u-1', displayName: 'Story', expiresAt: 0 };
    },
  });

  const access = defineStep({
    id: 'access',
    needs: ['session'],
    run: (ctx) => {
      return new Set([ctx.get('session').userId]);
    },
  });

  const config = defineStep({
    id: 'config',
    needs: ['session'],
    run: (ctx) => {
      ctx.notice('config:from-cache', { ageSeconds: 60 });
      ctx.intent('warn:trial-expiring', { daysLeft: 5 });
      return { workspaceName: 'Story Workspace', trialDaysLeft: 5 };
    },
  });

  // Optional and failing, so the run settles `degraded` rather than `ready`. A story that only ever
  // showed the happy path would not prove the status is being read at all.
  const tags = defineStep({
    id: 'tags:reference',
    needs: ['access'],
    optional: true,
    run: () => {
      throw new Error('the tags service is down');
    },
  });

  const warning = defineMountedStep({
    id: 'trial-warning',
    needs: ['config'],
    run: async (ctx) => {
      await ctx.awaitIntent('warn:trial-expiring', {
        daysLeft: ctx.get('config').trialDaysLeft,
      });
    },
  });

  return createBootstrap({ steps: [session, access, config, tags, warning] });
}

/**
 * What every story renders, whatever the framework.
 *
 * The component tests read these ids and nothing else, which is what lets one test file assert both
 * bindings.
 */
export const READOUT = {
  stage: 'stage',
  status: 'status',
  config: 'config',
  notices: 'notices',
  intentStatus: 'intent-status',
  settle: 'settle',
  drop: 'drop',
} as const;
