import { defineHostedStep, defineStep } from 'antumbra';
import type { Api } from './fake-api.js';

/**
 * The bootstrap of one application made of separate modules.
 *
 * Nothing here is about micro-frontends. It is the ordinary shape of a modular app: one module owns
 * the session, another owns access, two more own reference data they would each otherwise fetch on
 * first render. Written as a graph, the two module prefetches overlap because nothing says they
 * should not, and the guard runs first because everything says it should.
 *
 * The same graph works unchanged when those modules are deployed separately. That is a property of
 * the shape, not the reason for it.
 *
 * **Three steps are `scope: 'shared'`.** The session, the access check and the configuration are the
 * same answer for every module on the page, so the first bootstrap to reach one does the work and
 * the rest adopt it. The two reference lists stay app-scoped, because each module owns its own —
 * which is also what makes the contrast visible in the timeline.
 */
export function createSteps(api: Api) {
  const session = defineStep({
    id: 'session',
    scope: 'shared',
    timeout: 3000,
    run: async (ctx) => {
      const found = await api.session(ctx.signal);
      if (found === null) {
        // Queued before refusing, because the refusal is exactly when the app needs to know where
        // to send the user.
        ctx.intent('redirect:sign-in', { returnTo: '/dashboard' });
        return ctx.block('No session.');
      }
      return found;
    },
  });

  const access = defineStep({
    id: 'access',
    needs: ['session'],
    scope: 'shared',
    timeout: 3000,
    run: async (ctx) => {
      return new Set(await api.access(ctx.signal));
    },
  });

  const config = defineStep({
    id: 'config',
    needs: ['session'],
    scope: 'shared',
    optional: true,
    timeout: 3000,
    run: async (ctx) => {
      const found = await api.config(ctx.signal);
      if (found.fromCache) {
        ctx.notice('config:from-cache', { ageSeconds: 4 * 3600 });
      }
      if (found.trialDaysLeft < 30) {
        ctx.intent('warn:trial-expiring', { daysLeft: found.trialDaysLeft });
      }
      return { workspaceName: found.workspaceName, trialDaysLeft: found.trialDaysLeft };
    },
  });

  const projects = defineStep({
    id: 'projects:reference',
    needs: ['access'],
    optional: true,
    timeout: 2000,
    run: (ctx) => {
      return api.projects(ctx.signal);
    },
  });

  const tags = defineStep({
    id: 'tags:reference',
    needs: ['access'],
    optional: true,
    // Deliberately tight, so the "tags hangs" switch produces a timeout rather than a wait.
    timeout: 1200,
    run: async (ctx) => {
      try {
        return await api.tags(ctx.signal);
      } catch (error: unknown) {
        ctx.notice('module:unavailable', { module: 'tags' });
        throw error;
      }
    },
  });

  /**
   * The half that descends into the framework.
   *
   * It cannot run during preflight and the type says so: it reads `ctx.host`, which only exists once
   * a binding has handed one over, and it waits for an answer that only a mounted UI can give.
   */
  const trialWarning = defineHostedStep({
    id: 'trial-warning',
    needs: ['config'],
    run: async (ctx) => {
      if (ctx.get('config').trialDaysLeft < 30) {
        await ctx.awaitIntent('warn:trial-expiring', {
          daysLeft: ctx.get('config').trialDaysLeft,
        });
      }
    },
  });

  return [session, access, config, projects, tags, trialWarning];
}
