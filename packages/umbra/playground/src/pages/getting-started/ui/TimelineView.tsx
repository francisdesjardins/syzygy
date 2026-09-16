import type { RunEvent } from 'umbra/react';

/**
 * The run as it happens, driven by `boot.events()`.
 *
 * This is the thing a snapshot cannot do. The outcome arrives at the end and says what the app may
 * do; this says what is taking so long while the user is still looking at a blank page.
 */
export function TimelineView(props: { events: readonly RunEvent[]; stage: string }) {
  if (props.events.length === 0) {
    return <p className="empty">{props.stage === 'idle' ? 'Not started.' : 'Nothing yet.'}</p>;
  }

  // Focusable because it scrolls: a region a mouse can pan and a keyboard cannot is what axe
  // calls `scrollable-region-focusable`.
  return (
    <ol className="events" tabIndex={0} aria-label="Run events, in order">
      {props.events.map((event, index) => {
        return (
          <li key={index} className={`event event-${event.kind.replace(':', '-')}`}>
            {render(event)}
          </li>
        );
      })}
    </ol>
  );
}

function render(event: RunEvent) {
  switch (event.kind) {
    case 'run:start':
      return <span className="event-text">run started</span>;
    case 'level:start':
      return (
        <span className="event-text">
          level {event.level} starts:{' '}
          {event.ids
            .map((id) => {
              return String(id);
            })
            .join(', ')}
        </span>
      );
    case 'step:start':
      return (
        <span className="event-text">
          <code>{String(event.id)}</code> entered
        </span>
      );
    case 'step:settle':
      return (
        <span className="event-text">
          <code>{String(event.trace.id)}</code>{' '}
          <span className={`step-status step-status-${event.trace.status}`}>
            {event.trace.status}
          </span>{' '}
          <span className="duration">{Math.round(event.trace.durationMs)} ms</span>
          {event.trace.shared === true ? (
            <span className="shared" title="adopted from another bootstrap on this page">
              shared
            </span>
          ) : null}
        </span>
      );
    case 'notice':
      return (
        <span className="event-text">
          notice <code>{String(event.type)}</code> from <code>{String(event.step)}</code>
        </span>
      );
    case 'intent':
      return (
        <span className="event-text">
          intent <code>{String(event.type)}</code> queued by <code>{String(event.step)}</code>
        </span>
      );
    case 'run:settle':
      return (
        <span className="event-text">
          run settled: <strong className={`status status-${event.status}`}>{event.status}</strong>
        </span>
      );
    default:
      return null;
  }
}
