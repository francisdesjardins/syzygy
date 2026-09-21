import { expect, test } from '@playwright/test';
import type { StepTrace } from 'umbra/react';
import { fitNote, stepNote } from '@/pages/getting-started/model/step-note';

/**
 * The graph told a reader "a need did not succeed" over a box whose only need had succeeded.
 *
 * It was true of the two boxes beside it and false of that one, which is the failure mode a glance
 * cannot catch: the sentence is right often enough to look right. So the three endings behind
 * `skipped` are asserted here rather than read off a screenshot.
 */
const trace = (status: string, reason?: string): StepTrace => {
  return {
    id: 'step',
    level: 1,
    phase: 'preflight',
    status,
    startedAt: 0,
    durationMs: 0,
    ...(reason === undefined ? {} : { reason }),
  } as StepTrace;
};

const nothing = (): string | undefined => {
  return undefined;
};

test('a step that decided says so in its own words', () => {
  expect(
    stepNote({
      trace: trace('skipped', 'not a preview build'),
      needs: ['config'],
      statusOf: nothing,
    })
  ).toBe('not a preview build');
});

test('a step pruned behind a need that failed says which kind of stop it was', () => {
  const statusOf = (id: string): string | undefined => {
    return id === 'access' ? 'failed' : 'success';
  };

  expect(stepNote({ trace: trace('skipped'), needs: ['access'], statusOf })).toBe(
    'a need did not succeed'
  );
});

test('a step whose needs all succeeded was stopped by the run, not by its needs', () => {
  const statusOf = (): string => {
    return 'success';
  };

  // The case the graph got wrong: `debug-overlay` needs `config`, and `config` succeeded.
  expect(stepNote({ trace: trace('skipped'), needs: ['config'], statusOf })).toBe(
    'the run had stopped'
  );
});

test('a need with no trace of its own was not the cause either', () => {
  // It was never reached, so the run had already stopped before both of them.
  expect(stepNote({ trace: trace('skipped'), needs: ['never-reached'], statusOf: nothing })).toBe(
    'the run had stopped'
  );
});

test('an ending that explains itself adds nothing', () => {
  for (const status of ['success', 'failed', 'timed-out', 'cancelled']) {
    expect(
      stepNote({ trace: trace(status), needs: ['config'], statusOf: nothing }),
      status
    ).toBeUndefined();
  }
});

test('a step with no trace has not run yet', () => {
  expect(stepNote({ trace: undefined, needs: ['config'], statusOf: nothing })).toBeUndefined();
});

test('a reason too long for the box keeps its beginning and says it was cut', () => {
  const long = 'billing needs a grant the reports tier never issued';

  expect(fitNote(long)).toBe('billing needs a grant th…');
  expect(fitNote(long).length).toBe(25);
  expect(fitNote('a need did not succeed')).toBe('a need did not succeed');
});
