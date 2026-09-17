import type { ReactNode } from 'react';

type EclipseMoonProps = {
  readonly isDark: boolean;
  /**
   * Let the outer halo swell and fade, giving the three flame rhythms a common beat. Off on the
   * peeking mascot, which already moves. Slower than the slowest flame (8.3s against 5.1s), or it
   * stops being a floor under the flicker.
   */
  readonly breathing?: boolean | undefined;
  /** What the drawing is, for a reader who cannot see it. Each project's, like the face. */
  readonly label: string;
  /**
   * The face, engraved in light — strokes only, a woodcut has no fills. It receives the ink colour
   * rather than reading a token, because the corona *is* the light source here and the ink is
   * derived from the same scheme the flames are.
   */
  readonly face: (ink: string) => ReactNode;
};

/**
 * The heraldic/woodcut sun, inverted: the disc sits wholly inside the source and the light gets
 * around its rim. Eight flames drawn from inside the disc so only their tips clear it, each flanked
 * by a short and a middling one, because eight identical rays read as a cog. Inline, keeping the
 * no-binary-assets rule.
 *
 * **Everything here is the same in all three projects; the face is not.** Two copies of this had
 * drifted to 83% of one another, and the 17% was the expression — antumbra smirks because it spends
 * its life putting a shadow over your page, umbra watches because it starts a run it cannot hurry.
 * So the face is a prop and the drawing is one file.
 */
export function EclipseMoon({ isDark, breathing = false, label, face }: EclipseMoonProps) {
  // Warm in both themes; only the intensity shifts. Same value as the engraved face on purpose —
  // the corona *is* the light source, so a darker one (it was a full amber step down) inverts the
  // drawing's story and cost the flames their read at 120px. Definition comes from the outline.
  const flame = isDark ? '#fbbf24' : '#f59e0b';
  const flameEdge = isDark ? '#b45309' : '#92400e';
  const body = isDark ? '#0f172a' : '#1e293b';
  const bodyEdge = isDark ? '#334155' : '#475569';
  const ink = isDark ? '#fbbf24' : '#fcd34d';

  // One flame from the rim; eight rotated copies make the corona, tunable in one place.
  const ray = 'M87 68 C79 48, 94 36, 95 2 C104 26, 100 40, 106 34 C115 46, 117 54, 113 68 Z';

  /**
   * One cluster: `at` is degrees either side of the base angle, `sx` across the flame, `sy` along
   * it. Scaled about the disc centre, not the flame's own base, so no short flame lifts its root
   * above the rim. ±15° keeps three legible as three: closer they merge, wider they stop grouping.
   */
  const CLUSTER = [
    { at: -15, cls: 'um-flame-s', sx: 0.62, sy: 0.56 },
    { at: 0, cls: 'um-flame-l', sx: 1.14, sy: 1.0 },
    { at: 15, cls: 'um-flame-m', sx: 0.84, sy: 0.76 },
  ] as const;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="um-disc" cx="38%" cy="32%" r="76%">
          <stop offset="0%" stopColor={bodyEdge} />
          <stop offset="100%" stopColor={body} />
        </radialGradient>
        <radialGradient id="um-glow" cx="50%" cy="50%" r="50%">
          <stop offset="44%" stopColor={flame} stopOpacity="0" />
          <stop offset="76%" stopColor={flame} stopOpacity="0.34" />
          <stop offset="100%" stopColor={flame} stopOpacity="0" />
        </radialGradient>
        <style>{`
          /* One curve per size, and they are shaped differently rather than merely retimed.
             A small flame guttering is quick and nearly all opacity; a large one swells slowly
             and barely changes value. Sharing a keyframe and varying only the duration is what
             makes a corona pulse as one object, which is the thing to avoid. */
          @keyframes um-gutter {
            0%, 100% { opacity: 0.82; transform: scale(1); }
            35%      { opacity: 1;    transform: scale(1.06); }
            62%      { opacity: 0.9;  transform: scale(1.01); }
          }
          @keyframes um-swell {
            0%, 100% { opacity: 0.95; transform: scale(0.995); }
            50%      { opacity: 1;    transform: scale(1.045); }
          }
          @keyframes um-lick {
            0%, 100% { opacity: 0.9;  transform: scale(1); }
            28%      { opacity: 1;    transform: scale(1.03); }
            70%      { opacity: 0.94; transform: scale(1.015); }
          }
          /* Slower than every flame above, so it reads as the fire's floor rather than a fourth
             flicker. Scale and opacity move together — a halo that changes size without changing
             value looks like the drawing is zooming, not like light. */
          @keyframes um-breathe {
            0%, 100% { opacity: 0.76; transform: scale(1); }
            50%      { opacity: 1;    transform: scale(1.07); }
          }
          .um-halo { transform-origin: 100px 100px;
                     animation: um-breathe 8.3s ease-in-out infinite; }
          @keyframes um-blink {
            0%, 93%, 100% { transform: scaleY(1); }
            96%           { transform: scaleY(0.1); }
          }
          /* Durations are mutually prime-ish seconds so the three never come back into phase and
             hand the ring a visible period. */
          .um-flame-s, .um-flame-l, .um-flame-m { transform-origin: 100px 100px; }
          .um-flame-s { animation: um-gutter 2.3s ease-in-out infinite; }
          .um-flame-l { animation: um-swell  5.1s ease-in-out infinite; }
          .um-flame-m { animation: um-lick   3.4s ease-in-out infinite; }
          .um-eyes   { transform-origin: center; transform-box: fill-box;
                       animation: um-blink 6s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .um-flame-s, .um-flame-l, .um-flame-m, .um-eyes, .um-halo { animation: none; }
          }
        `}</style>
      </defs>

      <circle
        cx="100"
        cy="100"
        r="112"
        fill="url(#um-glow)"
        {...(breathing ? { className: 'um-halo' } : {})}
      />

      {/* Corona, behind the body. Each flame gets its own wrapper: the flicker is a CSS
          `transform` and the placement an SVG `transform` attribute, and on one element the first
          silently wins and the ring collapses to a single flame at 0°. */}
      <g fill={flame} stroke={flameEdge} strokeWidth="2.5" strokeLinejoin="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].flatMap((deg, i) => {
          return CLUSTER.map((cluster, j) => {
            // Negative delay: the corona is alight on the first frame instead of igniting
            // together, and the irrational-ish step stops the ring re-synchronising later.
            const delay = -(((i * 3 + j) * 0.41) % 5.1);
            return (
              <g
                key={`${deg.toString()}-${cluster.cls}`}
                className={cluster.cls}
                style={{ animationDelay: `${delay.toFixed(2)}s` }}
              >
                <path
                  d={ray}
                  transform={`rotate(${(deg + cluster.at).toString()} 100 100) translate(100 100) scale(${cluster.sx.toString()} ${cluster.sy.toString()}) translate(-100 -100)`}
                />
              </g>
            );
          });
        })}
      </g>

      <circle cx="100" cy="100" r="64" fill="url(#um-disc)" stroke={flameEdge} strokeWidth="3" />

      <g fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {face(ink)}
      </g>
    </svg>
  );
}
