import type { SVGProps } from 'react';

/**
 * Two glyphs, on the rules the sibling playgrounds' sets are drawn to: a 24×24 grid with content
 * inside a ~3px inset, stroke 1.75 on `currentColor`, round caps and joins, no fill.
 *
 * A set of three rather than a shared one: an icon set is a voice, and the two that exist are each
 * drawn for their own subject. What is shared between the playgrounds lives in corona; this is
 * two drawings for two of its routes. The drawer's handle and the palette are corona's,
 * which every playground draws the same.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

/** The scale: a rule with its ticks. */
export function RulerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="8" width="18" height="8" rx="1.5" />
      <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
    </svg>
  );
}

/** The layering: one sheet over another. */
export function LayersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 14l9 5 9-5" />
    </svg>
  );
}
