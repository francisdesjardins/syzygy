import type { Clock } from '../utils/clock.js';
import type { NoticeType, StepId } from './registry.js';
import type { Notice } from './types.js';

export type NoticeEntry = {
  readonly type: NoticeType;
  readonly payload: unknown;
  readonly step: StepId;
};

export type NoticeLog = {
  emit: (entry: NoticeEntry) => void;
  list: () => readonly Notice[];
};

/**
 * The run's notices, in emission order.
 *
 * Append-only, and nothing removes from it — including the failure of the step that wrote an entry.
 * A notice is a record of something that happened, and the step failing afterwards does not unhappen
 * it; the timeline is where the failure lives.
 */
export function createNoticeLog(options: {
  readonly clock: Clock;
  readonly onEmit?: ((notice: Notice) => void) | undefined;
}): NoticeLog {
  const notices: Notice[] = [];

  return {
    emit: (entry) => {
      const notice: Notice = {
        type: entry.type,
        payload: entry.payload,
        step: entry.step,
        at: options.clock.wall(),
        sequence: notices.length,
      };
      notices.push(notice);
      options.onEmit?.(notice);
    },
    list: () => {
      return notices;
    },
  };
}
