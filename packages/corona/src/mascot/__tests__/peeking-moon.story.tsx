import { useState } from 'react';

import { PeekingMoon } from '../PeekingMoon.js';

/**
 * The drawing the host lends, marked so a test can tell it apart from anything the mascot might
 * draw itself. The whole reason this component lives in corona is that it draws nothing: each
 * playground passes its own moon, and the behaviour around it is shared.
 */
const Face = () => {
  return (
    <svg viewBox="0 0 100 100" data-testid="face" aria-hidden>
      <circle cx="50" cy="50" r="40" />
    </svg>
  );
};

/** The mascot as a playground mounts it. */
export function PeekingMoonBasic() {
  return <PeekingMoon moon={<Face />} />;
}

/**
 * The mascot beside something to reach for.
 *
 * The shy rule is about the pointer approaching *it*, so a harness needs somewhere else for the
 * pointer to be first — otherwise the mouse starts on top of it and there is no approach to make.
 */
export function PeekingMoonShy() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div>
      <div
        data-testid="away"
        style={{ position: 'fixed', top: 0, left: 0, width: 60, height: 60 }}
      />
      <span data-testid="dismissed">{dismissed ? 'yes' : 'no'}</span>
      <div
        onClick={() => {
          setDismissed(true);
        }}
        // A bystander that records the click reaching it, so a test can tell a dismissed mascot
        // from one that merely stopped rendering.
        role="presentation"
      >
        <PeekingMoon moon={<Face />} />
      </div>
    </div>
  );
}
