import type { SVGProps } from 'react';

/**
 * The shell's icon set, drawn here rather than installed: the playground has no component library,
 * and one for nine glyphs would be the largest dependency on the page.
 *
 * Every glyph is a stroke on `currentColor`, so colour and size come from the caller. The rules the
 * set is drawn to, so a tenth matches the nine:
 *
 * - **24×24 grid, content inside a ~3px inset.** A glyph that touches the box reads a size bigger
 *   than its neighbours on the same row.
 * - **Stroke 1.75, round caps and joins, no fill.** The weight has to be constant — a hairline
 *   among them looks broken rather than lighter.
 * - **Open forms over closed ones**: an asymmetry stops straight lines reading as a texture.
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

export function ArrowBackIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M19.5 12h-15M11 5.5 4.5 12l6.5 6.5" />
    </svg>
  );
}

export function ArrowForwardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5" />
    </svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10.4 13.6a3.9 3.9 0 0 0 5.6 0l2.6-2.6a3.9 3.9 0 0 0-5.5-5.5l-1.5 1.5" />
      <path d="M13.6 10.4a3.9 3.9 0 0 0-5.6 0l-2.6 2.6a3.9 3.9 0 0 0 5.5 5.5l1.5-1.5" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4.6 4.6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 17 4 12l5-5M15 7l5 5-5 5" />
    </svg>
  );
}

export function ContentCopyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="8" y="8" width="12" height="12" rx="2.2" />
      <path d="M16 8V5.6A1.6 1.6 0 0 0 14.4 4H5.6A1.6 1.6 0 0 0 4 5.6v8.8A1.6 1.6 0 0 0 5.6 16H8" />
    </svg>
  );
}

export function DarkModeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 13.2A8.2 8.2 0 1 1 10.8 4a6.4 6.4 0 0 0 9.2 9.2Z" />
    </svg>
  );
}

export function LightModeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.8V5M12 19v2.2M2.8 12H5M19 12h2.2M5.5 5.5 7 7M17 17l1.5 1.5M18.5 5.5 17 7M7 17l-1.5 1.5" />
    </svg>
  );
}
