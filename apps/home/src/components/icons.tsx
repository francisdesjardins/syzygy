import type { SVGProps } from 'react';

/**
 * The three glyphs this site uses, on the rules the playgrounds' sets are drawn to: a 24×24 grid
 * with content inside a ~3px inset, stroke 1.75 on `currentColor`, round caps and joins, no fill.
 *
 * Drawn here rather than installed: `@mui/icons-material` is a package of two thousand glyphs, and
 * three of them were reaching the bundle.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  width: 22,
  height: 22,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

/** Switch to light: the sun you would be getting. */
export function SunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </svg>
  );
}

/** Switch to dark: the moon you would be getting. */
export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.3 8.3 0 1 0 20 14.5Z" />
    </svg>
  );
}

/**
 * The other language. A globe with its meridians rather than two scripts meeting: at 22px a pair of
 * glyphs is two smudges, and a globe is read as language everywhere a language switch appears.
 */
export function TranslateIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.4 12h17.2" />
      <ellipse cx="12" cy="12" rx="3.7" ry="8.6" />
    </svg>
  );
}
