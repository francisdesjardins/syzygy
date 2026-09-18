import { useEffect, useState } from 'react';

import { TokenSwatches } from '../ui/TokenSwatches.js';
import type { TokenNote } from '../contract.js';

/** Two the gallery's skin declares in both schemes, and one nothing declares at all. */
const TOKENS: readonly TokenNote[] = [
  ['--app-flame', 'The fill'],
  ['--app-accent', 'The ink'],
  ['--app-not-a-token', 'Declared by nobody'],
];

export function TokenSwatchesBasic() {
  return <TokenSwatches tokens={TOKENS} />;
}

/**
 * The scheme flipped from an ordinary effect, which is the shape that cost a defect.
 *
 * A provider writing `data-color-scheme` from `useEffect` writes it *after* its descendants' effects
 * have run. A table asking React when the scheme changed would read the outgoing scheme's values and
 * keep them; one watching the attribute is right whoever sets it and whenever they do. The harness
 * reproduces the late write on purpose.
 */
export function TokenSwatchesLateScheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.dataset['colorScheme'] = dark ? 'dark' : 'light';
  }, [dark]);

  return (
    <div>
      <button
        type="button"
        data-testid="flip"
        onClick={() => {
          setDark((was) => {
            return !was;
          });
        }}
      >
        flip
      </button>
      <TokenSwatches tokens={TOKENS} />
    </div>
  );
}
