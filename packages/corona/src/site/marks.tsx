/**
 * The four glyphs the drawer's foot is drawn with, on the same rules as a playground's own set: a
 * 24×24 grid, content inside a ~3px inset, stroke 1.75 on `currentColor`, round caps and joins.
 *
 * **Three of them are the naming.** Antumbra, umbra and penumbra are the three regions of a shadow,
 * and a reader meeting the words in a menu has no way to know that. Drawn, they explain themselves:
 * the umbra is the cone where the source is gone, the antumbra is past its tip where the source
 * shows as a ring, and the penumbra is the partial shade at the edge. A fill is deliberate here —
 * the whole distinction is how much light gets through, which an outline cannot say.
 */

const base = {
  viewBox: '0 0 24 24',
  width: 18,
  height: 18,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

/** The site around the playgrounds. A house, because every reader already knows this one. */
export function HouseMark() {
  return (
    <svg {...base}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.8V20h12V9.8" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

/** Total shadow: the source is gone entirely. */
export function UmbraMark() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Past the cone's tip: the body sits wholly inside the source, which shows as a ring around it. */
export function AntumbraMark() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The partial shade at the edge, where the source is half blocked. */
export function PenumbraMark() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="8" />
      {/* Half the disc, cut on the vertical: the terminator is what the word means. */}
      <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
