import { EclipseMoon } from 'corona';

/**
 * umbra's face on [corona](../../../../../corona)'s eclipse.
 *
 * Where antumbra smirks, this one watches. The umbra is the total shadow, the part of the cone
 * where the source is gone entirely: the dark this library runs in, before anything has been lit.
 * Its job is to start everything while there is still nothing to see, and then wait on an answer it
 * cannot hurry. The drawing around the face is the same in every playground and lives there.
 */
export function UmbraMoon({
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
      label="An annular eclipse with a face, peeking"
      face={(ink) => {
        return (
          <>
            {/* Brows lifted and level, where antumbra's angle down into the smirk. Still a clear
                gap over the nose — let them meet and the face gains a unibrow. */}
            <path d="M64 76 C72 64, 85 62, 94 70" strokeWidth="6.5" />
            <path d="M106 70 C115 62, 128 64, 136 76" strokeWidth="6.5" />

            <g className="um-eyes">
              {/* Round and open, not narrowed by a straight lid: an umbra is the ring where the
                  light gets all the way around, and the eye is that shape on purpose. */}
              <circle cx="85" cy="93" r="11" strokeWidth="3" />
              <circle cx="115" cy="93" r="11" strokeWidth="3" />
              <circle cx="85" cy="93" r="4.5" fill={ink} stroke="none" />
              <circle cx="115" cy="93" r="4.5" fill={ink} stroke="none" />
            </g>

            <path d="M100 104 L97 122 C97 126, 103 126, 104 122" strokeWidth="3" />

            {/* An "oh" rather than a smirk — the mouth of something waiting on an answer, which is
                exactly what a mounted step does. */}
            <ellipse cx="100" cy="138" rx="8.5" ry="7" strokeWidth="3.5" />
          </>
        );
      }}
    />
  );
}
