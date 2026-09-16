/**
 * What a declared registry buys, compiled on its own because declaration merging is global:
 * augmenting `StepRegistry` in the main project would narrow ids for every other type test there.
 *
 * Run by `yarn type-check:registry`, which `yarn type-check` calls.
 */

import { createBootstrap } from '../src/core/create-bootstrap.js';
import { defineHostedStep, defineStep } from '../src/core/define-step.js';
import type { DataOf, StepId } from '../src/core/registry.js';
import type { AnyStep } from '../src/core/types.js';

declare module '../src/core/registry.js' {
  interface StepRegistry {
    session: { userId: string; expiresAt: number };
    config: { daysLeft: number };
  }
  interface NoticeRegistry {
    'config:from-cache': { age: number };
    'boot:offline': void;
  }
  interface IntentRegistry {
    'warn:trial': { daysLeft: number };
  }
  interface HostCapabilities {
    confirm: (message: string) => Promise<boolean>;
  }
}

type Equals<A, B> =
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- both `T`s here: the identity trick compares two signatures, and a parameter used once is exactly what makes them comparable
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;

/** A declared id carries its data type. */
export type _DataNarrows = Assert<Equals<DataOf<'session'>, { userId: string; expiresAt: number }>>;

/** An undeclared id still works, and answers `unknown` rather than `any`. */
export type _UndeclaredIsUnknown = Assert<Equals<DataOf<'someone-elses-step'>, unknown>>;

/** The id space stays open, which is what lets a project adopt this one step at a time. */
export const _openIdSpace: StepId = 'a-step-nobody-declared';

export function _stepTypes() {
  const session = defineStep({
    id: 'session',
    run: () => {
      return { userId: 'u1', expiresAt: 0 };
    },
  });

  // @ts-expect-error the declared data type is not a string
  defineStep({ id: 'session', run: () => 'wrong' });

  const config = defineStep({
    id: 'config',
    needs: ['session'],
    run: (ctx) => {
      // Reading a declared dependency gives back its declared type.
      const id: string = ctx.get('session').userId;
      return { daysLeft: id.length };
    },
  });

  defineStep({
    id: 'config',
    needs: ['session'],
    run: (ctx) => {
      // @ts-expect-error `config` is not in this step's needs
      ctx.get('config');
      return { daysLeft: 0 };
    },
  });

  return [session, config];
}

export function _noticeAndIntentPayloads() {
  defineStep({
    id: 'session',
    run: (ctx) => {
      ctx.notice('config:from-cache', { age: 1 });
      // A notice declared as `void` takes no payload at all.
      ctx.notice('boot:offline');
      // An undeclared type still works, with an optional payload.
      ctx.notice('something:else');
      ctx.notice('something:else', { anything: true });

      // @ts-expect-error the declared payload is required
      ctx.notice('config:from-cache');
      // @ts-expect-error and it is checked
      ctx.notice('config:from-cache', { age: 'old' });

      ctx.intent('warn:trial', { daysLeft: 3 });

      return { userId: 'u1', expiresAt: 0 };
    },
  });
}

export function _phasesHaveDifferentContexts() {
  defineStep({
    id: 'guard',
    run: (ctx) => {
      // @ts-expect-error a preflight step has no UI port; nothing is mounted yet
      ctx.host;
      return ctx.block('no session');
    },
  });

  defineHostedStep({
    id: 'warn',
    run: async (ctx) => {
      // The declared port is what the framework layer said it could do.
      await ctx.host.confirm('carry on?');
      await ctx.awaitIntent('warn:trial', { daysLeft: 3 });

      // @ts-expect-error a mounted step cannot refuse a mount that already happened
      ctx.block('too late');
    },
  });
}

export async function _outcomeIsDiscriminated() {
  const boot = createBootstrap({
    steps: [
      defineStep({
        id: 'session',
        run: () => {
          return { userId: 'u1', expiresAt: 0 };
        },
      }),
    ],
  });
  const outcome = await boot.run();

  // @ts-expect-error data is partial until the status says otherwise
  outcome.data.session.userId;

  if (outcome.status === 'ready') {
    // A ready run has every declared key, so nothing here needs narrowing.
    const userId: string = outcome.data.session.userId;
    return userId;
  }
  return outcome.blockedBy?.reason;
}

export function _needsMustNameAStepThatExists() {
  const session = defineStep({
    id: 'session',
    run: () => {
      return { userId: 'u1', expiresAt: 0 };
    },
  });
  const config = defineStep({
    id: 'config',
    needs: ['session'],
    run: () => {
      return { daysLeft: 1 };
    },
  });
  const orphan = defineStep({
    id: 'config',
    // A perfectly valid `StepId` — the id space is open on purpose — and a typo.
    needs: ['sesssion'],
    run: () => {
      return { daysLeft: 1 };
    },
  });

  // The whole list is consistent, so nothing extra is asked of the caller.
  createBootstrap({ steps: [session, config] });

  // @ts-expect-error `sesssion` is not a step in this list
  createBootstrap({ steps: [session, orphan] });

  // A list whose ids are not literals — what a helper that builds steps dynamically produces —
  // subtracts to `never` on both sides and is left alone.
  const erased: AnyStep[] = [session, orphan];
  createBootstrap({ steps: erased });
}

export function _twoStepsMayNotShareAnId() {
  const session = defineStep({
    id: 'session',
    run: () => {
      return { userId: 'u1', expiresAt: 0 };
    },
  });
  const again = defineStep({
    id: 'session',
    run: () => {
      return { userId: 'u2', expiresAt: 0 };
    },
  });

  // @ts-expect-error two steps declare `session`
  createBootstrap({ steps: [session, again] });

  // A list built dynamically has no known positions, so nothing is claimed about them and
  // `compilePlan` is what catches it at construction.
  const erased: AnyStep[] = [session, again];
  createBootstrap({ steps: erased });
}
