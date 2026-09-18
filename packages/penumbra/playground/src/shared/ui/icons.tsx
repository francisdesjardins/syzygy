import type { SVGProps } from 'react';

/**
 * Four glyphs, on the rules the sibling playgrounds' sets are drawn to: a 24×24 grid with content
 * inside a ~3px inset, stroke 1.75 on `currentColor`, round caps and joins, no fill.
 *
 * A set of three rather than a shared one: an icon set is a voice, and the two that exist are each
 * drawn for their own subject. What is shared between the playgrounds lives in corona; this is
 * four drawings for three routes and a drawer.
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

/** The drawer's handle, on phones. */
export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

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

/** The rules the palette is held to. */
export function PaletteIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.6-1-2.6 0-.8.7-1.4 1.6-1.4H16a5 5 0 0 0 5-5c0-4-4-7.3-9-7.3Z" />
      <circle cx="8" cy="10" r="1.1" />
      <circle cx="12.5" cy="7.5" r="1.1" />
      <circle cx="16.5" cy="10.5" r="1.1" />
    </svg>
  );
}
