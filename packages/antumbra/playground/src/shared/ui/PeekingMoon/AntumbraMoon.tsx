import { EclipseMoon } from 'corona';

/**
 * antumbra's face on [corona](../../../../../corona)'s eclipse.
 *
 * Smug rather than the jolly heraldic sun it borrows from: a dialog manager spends its life putting
 * a shadow over your page and waiting for you to deal with it. The drawing around it — the corona,
 * the disc, the flicker — is the same in every playground and lives there.
 */
export function AntumbraMoon({
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
      label="An eclipsed sun with a face, peeking"
      face={(ink) => {
        return (
          <>
            {/* Brows: a clear gap over the nose — let them meet and the face gains a unibrow. */}
            <path d="M64 82 C72 68, 85 66, 93 75" strokeWidth="6.5" />
            <path d="M107 75 C115 66, 128 68, 136 82" strokeWidth="6.5" />

            <g className="um-eyes">
              <path d="M70 92 C78 84, 92 84, 99 92 C92 99, 78 99, 70 92 Z" strokeWidth="3" />
              <path d="M101 92 C108 84, 122 84, 130 92 C122 99, 108 99, 101 92 Z" strokeWidth="3" />
              {/* The straight upper lid is what narrows the eye without shrinking it. */}
              <path d="M70 91 C78 86, 92 86, 99 91" strokeWidth="4.5" />
              <path d="M101 91 C108 86, 122 86, 130 91" strokeWidth="4.5" />
              <circle cx="85" cy="92" r="4" fill={ink} stroke="none" />
              <circle cx="115" cy="92" r="4" fill={ink} stroke="none" />
            </g>

            <path d="M100 100 L97 120 C97 124, 103 124, 104 120" strokeWidth="3" />

            {/* The smirk: asymmetric on purpose — a symmetric curve is a smile. */}
            <path d="M83 134 C94 134, 107 133, 116 126" strokeWidth="4" />
            <path d="M118 122 C120 126, 120 130, 118 133" strokeWidth="3" />
          </>
        );
      }}
    />
  );
}
