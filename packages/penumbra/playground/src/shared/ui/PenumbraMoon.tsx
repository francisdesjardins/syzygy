import { EclipseMoon } from 'corona/mascot';

/**
 * penumbra's face on [corona](../../../../../corona)'s eclipse.
 *
 * Where antumbra smirks and umbra watches, this one is at rest. The penumbra is the partial shade
 * at a shadow's edge — the region that is neither lit nor dark, and the only one of the three with
 * nothing to resolve. A package that ships a scale with no colour and a palette with no brand has
 * no argument to win, which is a face with its eyes softly closed.
 *
 * The drawing around it — the corona, the disc, the flicker — is the same in every playground and
 * lives there.
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
            {/* Brows level and unhurried, higher than either sibling's: nothing here is narrowed
                at anything. Still a clear gap over the nose, or the face gains a unibrow. */}
            <path d="M63 74 C72 66, 85 65, 93 71" strokeWidth="6" />
            <path d="M107 71 C115 65, 128 66, 137 74" strokeWidth="6" />

            <g className="um-eyes">
              {/* Closed, curving up. An open eye is a question and a narrowed one is a judgement;
                  this is neither. The lashes are what stop two arcs reading as a second pair of
                  brows at 120px. */}
              <path d="M70 95 C78 105, 92 105, 100 95" strokeWidth="4" />
              <path d="M100 95 C108 105, 122 105, 130 95" strokeWidth="4" />
              <path d="M73 101 L70 106" strokeWidth="2.5" />
              <path d="M127 101 L130 106" strokeWidth="2.5" />
            </g>

            <path d="M100 106 L97 123 C97 127, 103 127, 104 123" strokeWidth="3" />

            {/* A small, even smile — symmetric on purpose, where antumbra's is deliberately not. */}
            <path d="M88 136 C94 141, 106 141, 112 136" strokeWidth="3.5" />

            {/* The terminator, faint across the disc: the one thing on this face that is the word
                itself. Drawn in ink at a fraction of its weight so it reads as shade rather than
                as a line somebody forgot to finish. */}
            <path
              d="M100 36 C86 58, 86 142, 100 164"
              strokeWidth="2"
              stroke={ink}
              strokeOpacity="0.28"
            />
          </>
        );
      }}
    />
  );
}
