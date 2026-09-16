import type { RunEvent, StepTrace } from 'antumbra/react';

const ROW_H = 26;
const LABEL_W = 150;

/**
 * The run against a clock, because the claim is about simultaneity.
 *
 * A list of events can say two steps succeeded; it cannot say they were in flight at the same time,
 * which is the only interesting thing about running them as a graph. Bars laid on one axis say it
 * without a sentence — and the moment a step is given a budget it cannot meet, its bar visibly stops
 * short of the others.
 */
export function RunChart(props: { events: readonly RunEvent[]; timeline: readonly StepTrace[] }) {
  const start = props.events.find((event) => {
    return event.kind === 'run:start';
  })?.at;

  const ran = props.timeline.filter((trace) => {
    return trace.status !== 'skipped';
  });

  if (start === undefined || ran.length === 0) {
    return <p className="empty">Nothing has run yet.</p>;
  }

  const total = Math.max(
    ...ran.map((trace) => {
      return trace.startedAt - start + trace.durationMs;
    }),
    1
  );
  const width = 460;
  const scale = (ms: number): number => {
    return (ms / total) * width;
  };

  return (
    <div className="graph-scroll" tabIndex={0} role="group" aria-label="Run timeline, scrollable">
      <svg
        className="run-chart"
        width={LABEL_W + width + 52}
        height={ran.length * ROW_H + 22}
        role="img"
        aria-label="Each step as a bar on one time axis"
      >
        {ran.map((trace, index) => {
          const offset = trace.startedAt - start;
          const barY = index * ROW_H + 4;
          return (
            <g key={String(trace.id)}>
              <text x={0} y={barY + 13} className="bar-label">
                {String(trace.id)}
              </text>
              <rect
                x={LABEL_W + scale(offset)}
                y={barY}
                width={Math.max(scale(trace.durationMs), 3)}
                height={ROW_H - 10}
                rx={3}
                className={`bar bar-${trace.status}${trace.shared === true ? ' bar-shared' : ''}`}
              />
              <text
                x={LABEL_W + scale(offset) + Math.max(scale(trace.durationMs), 3) + 6}
                y={barY + 13}
                className="bar-value"
              >
                {Math.round(trace.durationMs)} ms
                {trace.shared === true ? ' · shared' : ''}
              </text>
            </g>
          );
        })}
        <line
          x1={LABEL_W}
          y1={ran.length * ROW_H + 4}
          x2={LABEL_W + width}
          y2={ran.length * ROW_H + 4}
          className="axis"
        />
        <text x={LABEL_W} y={ran.length * ROW_H + 18} className="bar-value">
          0
        </text>
        <text
          x={LABEL_W + width}
          y={ran.length * ROW_H + 18}
          className="bar-value"
          textAnchor="end"
        >
          {Math.round(total)} ms
        </text>
      </svg>
    </div>
  );
}
