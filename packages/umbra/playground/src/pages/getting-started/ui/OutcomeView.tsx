import type { Intent, Outcome } from 'umbra/react';

const STATUS_MEANING: Record<string, string> = {
  ready: 'No step failed. Mount everything.',
  degraded: 'An optional step failed. Mount, and read the notices to know what is missing.',
  blocked: 'A guard refused. Do not mount; the intents say where to send the user.',
  failed: 'A required step failed. Do not mount.',
  aborted: 'Something stopped the run from outside.',
};

export function OutcomeView(props: { outcome: Outcome | undefined; intents: readonly Intent[] }) {
  const { outcome } = props;
  if (outcome === undefined) {
    return null;
  }

  return (
    <div className="readout">
      <p className="verdict">
        <strong className={`status status-${outcome.status}`}>{outcome.status}</strong>
        <span className="meaning">{STATUS_MEANING[outcome.status] ?? ''}</span>
      </p>

      {outcome.status !== 'ready' && outcome.blockedBy !== undefined ? (
        <p className="blocked-by">
          <code>{String(outcome.blockedBy.step)}</code> refused: {outcome.blockedBy.reason}
        </p>
      ) : null}

      <span className="group-label">Data</span>
      {Object.keys(outcome.data).length === 0 ? (
        <p className="empty">Nothing resolved.</p>
      ) : (
        <ul className="data">
          {Object.entries(outcome.data).map(([id, value]) => {
            return (
              <li key={id}>
                <code>{id}</code>
                <span className="value">{summarize(value)}</span>
              </li>
            );
          })}
        </ul>
      )}

      <span className="group-label">Notices</span>
      {outcome.notices.length === 0 ? (
        <p className="empty">None.</p>
      ) : (
        <ul className="notices">
          {outcome.notices.map((notice) => {
            return (
              <li key={notice.sequence}>
                <code>{String(notice.type)}</code>
                <span className="value">{summarize(notice.payload)}</span>
                <span className="from">from {String(notice.step)}</span>
              </li>
            );
          })}
        </ul>
      )}

      <span className="group-label">Intents</span>
      {props.intents.length === 0 ? (
        <p className="empty">None.</p>
      ) : (
        <ul className="intents">
          {props.intents.map((intent) => {
            return (
              <li key={intent.id}>
                <code>{String(intent.type)}</code>
                <span className={`intent-status intent-${intent.status}`}>{intent.status}</span>
                {intent.droppedReason === undefined ? null : (
                  <span className="reason">{intent.droppedReason}</span>
                )}
                <span className="from">
                  from {String(intent.origin.step)} ({intent.origin.stepStatus})
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <span className="group-label">Errors</span>
      {outcome.errors.length === 0 ? (
        <p className="empty">None.</p>
      ) : (
        <ul className="errors">
          {outcome.errors.map((failure) => {
            return (
              <li key={String(failure.step)}>
                <code>{String(failure.step)}</code>
                <span className={`step-status step-status-${failure.status}`}>
                  {failure.status}
                </span>
                <span className="value">{failure.error.message}</span>
                {failure.tolerated ? <span className="tolerated">tolerated</span> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function summarize(value: unknown): string {
  if (value instanceof Set) {
    return `Set(${String(value.size)})`;
  }
  if (Array.isArray(value)) {
    return `${String(value.length)} entries`;
  }
  if (value === undefined) {
    return '—';
  }
  return JSON.stringify(value);
}
