import { mustGet } from '../utils/must-get.js';
import type { Clock } from '../utils/clock.js';
import type { IntentType, StepId } from './registry.js';
import type { Intent, StepStatus } from './types.js';

export type IntentEntry = {
  readonly type: IntentType;
  readonly payload: unknown;
  readonly step: StepId;
};

/**
 * The half a step context needs: somewhere to put an intent.
 *
 * Narrower than {@link IntentQueue} on purpose. A mounted step writes into the live run's
 * queue, which has no `finalize` to give — the run it would have frozen is already over.
 */
export type IntentSink = {
  /** Returns the id of the record this emission landed on, new or existing. */
  emit: (entry: IntentEntry) => string;
};

export type IntentQueue = IntentSink & {
  /**
   * Freeze the collected intents, filling in how each emitting step ended.
   *
   * The origin's outcome is not known at emission time and is exactly what an app's forwarding
   * decision turns on, so it is stamped here rather than guessed there.
   */
  finalize: (statusOf: (step: StepId) => StepStatus) => readonly Intent[];
};

/**
 * What a run queues for the framework to act on.
 *
 * Collection only: state transitions, forwarding and settling belong to the live run, which is the
 * thing that exists after a binding has mounted. Keeping them apart is what lets the outcome be a
 * frozen snapshot rather than a live object nobody is obliged to drain.
 *
 * **Deduplication is by type, first write wins.** A boot that hits the same warning twice has one
 * warning to show, and the count is on the record. Emitting the same type with two different
 * payloads and expecting two entries means the type is describing two different things.
 */
export function createIntentQueue(options: {
  readonly clock: Clock;
  readonly onEmit?: ((entry: IntentEntry) => void) | undefined;
}): IntentQueue {
  const clock = options.clock;
  const order: IntentType[] = [];
  const byType = new Map<IntentType, { record: Intent; step: StepId }>();

  return {
    emit: (entry) => {
      const existing = byType.get(entry.type);
      if (existing !== undefined) {
        byType.set(entry.type, {
          step: existing.step,
          record: { ...existing.record, occurrences: existing.record.occurrences + 1 },
        });
        return existing.record.id;
      }

      options.onEmit?.(entry);
      const id = `intent-${String(order.length)}-${String(entry.type)}`;
      order.push(entry.type);
      byType.set(entry.type, {
        step: entry.step,
        record: {
          id,
          type: entry.type,
          payload: entry.payload,
          origin: { step: entry.step, stepStatus: 'success' },
          at: clock.wall(),
          sequence: order.length - 1,
          occurrences: 1,
          status: 'pending',
        },
      });
      return id;
    },

    finalize: (statusOf) => {
      return order.map((type) => {
        const held = mustGet(byType, type);
        return Object.freeze({
          ...held.record,
          origin: { step: held.step, stepStatus: statusOf(held.step) },
        });
      });
    },
  };
}
