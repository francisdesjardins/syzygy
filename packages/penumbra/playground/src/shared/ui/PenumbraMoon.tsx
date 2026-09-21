import { EclipseMoon } from 'corona/mascot';

/**
 * penumbra's face on [corona](../../../../../corona)'s eclipse.
 *
 * Where antumbra smirks and umbra watches, this one is at rest. The penumbra is the partial shade
 * at a shadow's edge, the only one of the three with nothing to resolve — a package shipping a
 * scale with no colour and a palette with no brand has no argument to win.
 *
 * Two things this face refuses. A terminator across the disc crosses the nose at any size and reads
 * as a line somebody forgot to finish; the top bar's mark carries that idea whole. And the eyes stay
 * closed rather than half-lidded, since `um-eyes` squashes to `scaleY(0.1)` and a shut eye doing
 * that disappears.
 *
 * The drawing around it — corona, disc, flicker — is shared and lives there.
 */
export function PenumbraMoon({
  isDark,
  breathing = false,
}: {
  readonly isDark: boolean;
  readonly breathing?: boolean | undefined;
}) {
  return (
    <EclipseMoon
      isDark={isDark}
      breathing={breathing}
      label="A partial eclipse with a face, peeking"
      face={(ink) => {
        return (
          <>
            {/* Relaxed and low, close to the eye. Antumbra's angle down into a smirk and umbra's
                lift in surprise; nothing here is doing either. */}
            <path d="M64 79 C72 72, 85 71, 93 76" strokeWidth="6" />
            <path d="M107 76 C115 71, 128 72, 136 79" strokeWidth="6" />

            <g className="um-eyes">
              {/* Half-lidded, which is the word: the penumbra is the part of a shadow where the
                  source is *partly* covered. A lid across the top third says that, and it still
                  blinks — closed eyes on a blinking group squash to nothing. */}
              <circle cx="85" cy="95" r="10" strokeWidth="3" />
              <circle cx="115" cy="95" r="10" strokeWidth="3" />
              <path d="M74 92 C79 87, 91 87, 96 92" strokeWidth="4.5" />
              <path d="M104 92 C109 87, 121 87, 126 92" strokeWidth="4.5" />
              <circle cx="85" cy="97" r="4" fill={ink} stroke="none" />
              <circle cx="115" cy="97" r="4" fill={ink} stroke="none" />
            </g>

            <path d="M100 106 L97 123 C97 127, 103 127, 104 123" strokeWidth="3" />

            {/* A small, even smile — symmetric on purpose, where antumbra's is deliberately not. */}
            <path d="M88 136 C94 141, 106 141, 112 136" strokeWidth="3.5" />
          </>
        );
      }}
    />
  );
}
