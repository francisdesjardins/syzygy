import type { StepTrace } from 'umbra/react';

/**
 * The line a box adds under its status, for the one status that covers three endings.
 *
 * `skipped` is the step that decided it does not apply, the step pruned behind a need that did not
 * succeed, and the step never reached because a required failure had stopped the run. Only the
 * first carries a reason; the other two are told apart by reading the step's own needs.
 *
 * Out here rather than in the drawing because it is a claim worth a test: "a need did not succeed"
 * over a box whose only need succeeded is worse than saying nothing.
 */
export function stepNote(step: {
  readonly trace: StepTrace | undefined;
  readonly needs: readonly string[];
  /** What the timeline says about one of this step's needs, if it has anything to say. */
  readonly statusOf: (id: string) => string | undefined;
}): string | undefined {
  const { trace, needs, statusOf } = step;

  if (trace === undefined) {
    return undefined;
  }
  if (trace.reason !== undefined) {
    return trace.reason;
  }
  if (trace.status !== 'skipped') {
    return undefined;
  }

  // A need with no trace of its own was never reached either, so it cannot be what stopped this one.
  const needFailed = needs.some((need) => {
    const status = statusOf(need);
    return status !== undefined && status !== 'success';
  });

  return needFailed ? 'a need did not succeed' : 'the run had stopped';
}

/** The box is 152px wide and this line is 10.5px; the full text stays in the node's `<title>`. */
export function fitNote(text: string): string {
  return text.length > 25 ? `${text.slice(0, 24)}…` : text;
}
