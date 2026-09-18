import { useState } from 'react';
import { useDialog } from '../../react/use-dialog.js';

/**
 * A dialog whose exit is a `@keyframes` animation rather than a transition.
 *
 * This is a legal way to animate one and the library never learns of it: the caller names an
 * `animation` in the exit style and writes the keyframes themselves. `transitionend` is a
 * transition's event, so it never fires here — which is the whole point of the harness.
 *
 * The keyframes are injected rather than imported: this file ships in the library's own `src/`,
 * where a stylesheet would be a second thing the package emits.
 */
const KEYFRAMES = `
@keyframes harness-exit {
  from { opacity: 1; }
  to { opacity: 0; }
}
`;

let injected = false;
const ensureKeyframes = () => {
  if (injected || typeof document === 'undefined') {
    return;
  }
  injected = true;
  const style = document.createElement('style');
  style.textContent = KEYFRAMES;
  document.head.append(style);
};

/**
 * The exit runs for 400 ms while `exitDuration` says 120.
 *
 * The two disagree on purpose: settled by the safety timer, the close lands at 170 ms and cuts the
 * animation at two fifths. Settled by the animation, it lands at its end.
 */
export function KeyframedExitHarness() {
  ensureKeyframes();
  const [closedAt, setClosedAt] = useState<number | null>(null);
  const [openedAt, setOpenedAt] = useState(0);

  const { open, isVisible, Dialog } = useDialog({
    id: 'keyframed-exit',
    ariaLabel: 'Keyframed exit',
    animation: {
      entrance: { opacity: 1 },
      exit: { opacity: 0, animation: 'harness-exit 400ms linear forwards' },
      duration: 80,
      exitDuration: 120,
      transitionProperty: 'opacity',
    },
    render: ({ handle }) => {
      return (
        <div>
          <p>Keyframed</p>
          <button
            data-testid="close"
            onClick={() => {
              setOpenedAt(performance.now());
              handle.close();
            }}
          >
            Close
          </button>
        </div>
      );
    },
    onClose: () => {
      setClosedAt(performance.now() - openedAt);
    },
  });

  return (
    <div>
      <button
        data-testid="open"
        onClick={() => {
          void open();
        }}
      >
        Open
      </button>
      <span data-testid="visible">{isVisible ? 'yes' : 'no'}</span>
      <span data-testid="elapsed">{closedAt === null ? '' : Math.round(closedAt)}</span>
      {Dialog}
    </div>
  );
}
