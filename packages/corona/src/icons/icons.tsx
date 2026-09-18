import type { SVGProps } from 'react';

/**
 * The glyphs every playground draws, on the mascot's engraved line rather than a component
 * library's filled silhouettes. Every one is a stroke on `currentColor`, so colour and size come
 * from the caller.
 *
 * The rules the set is drawn to, so a fifteenth glyph matches the fourteen:
 *
 * - **24×24 grid, content inside a ~3px inset.** A glyph that touches the box reads a size bigger
 *   than its neighbours on the same row.
 * - **Stroke 1.75, round caps and joins, no fill.** The weight has to be constant — a hairline
 *   among them looks broken rather than lighter.
 * - **Open forms over closed ones**: an asymmetry stops straight lines reading as a texture, which
 *   is why the drawer's third bar is short.
 *
 * **These are here because the two sets were one set with two copies**, and the file that held the
 * second said so: "the day the playgrounds share a monorepo these collapse rather than being
 * reconciled." Measured on that day, sixteen names were in both and all sixteen were byte-identical.
 * Two of them, the sun and the moon, went nowhere — the theme toggle draws its own now.
 *
 * What a playground has that the others do not stays with it. An icon set is a voice only where the
 * drawings differ, and these did not.
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

export function HubIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      {/* Spokes first, so the nodes sit on top of the line ends rather than beside them. */}
      <path d="M12 9.4V6.6M10 13.6 7.3 15.5M14 13.6l2.7 1.9" />
      <circle cx="12" cy="12" r="2.6" />
      <circle cx="12" cy="4.6" r="2" />
      <circle cx="5.6" cy="17" r="2" />
      <circle cx="18.4" cy="17" r="2" />
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

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

export function MenuBookIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 6.6v13" />
      <path d="M12 6.6C10.4 5.2 8.3 4.5 5.9 4.5c-1 0-1.9.1-2.9.4v13c1-.3 1.9-.4 2.9-.4 2.4 0 4.5.7 6.1 2" />
      <path d="M12 6.6c1.6-1.4 3.7-2.1 6.1-2.1 1 0 1.9.1 2.9.4v13c-1-.3-1.9-.4-2.9-.4-2.4 0-4.5.7-6.1 2" />
    </svg>
  );
}

export function PaletteIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.4c-4.9 0-8.9 3.9-8.9 8.6s4 8.6 8.9 8.6c1.2 0 2.1-.9 2.1-2.1 0-.6-.2-1.1-.6-1.5a1.85 1.85 0 0 1 1.4-3.1h1.8c2.4 0 4.3-1.9 4.3-4.3 0-3.4-3.6-6.2-9-6.2Z" />
      {/* The wells are filled: a stroked 2px ring turns to a smudge at 20px. */}
      <circle cx="7.4" cy="12.4" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="8.4" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="14.4" cy="8.2" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="17.2" cy="11.4" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlayArrowIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7.5 5.4v13.2L18.8 12Z" />
    </svg>
  );
}

export function ScienceIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.8 3.4h4.4" />
      <path d="M10.6 3.4v6.3l-5.3 8.1a1.7 1.7 0 0 0 1.4 2.6h10.6a1.7 1.7 0 0 0 1.4-2.6l-5.3-8.1V3.4" />
      {/* The fill line: what makes a flask a flask rather than a funnel. Held 1px inside each wall
          (which is at x=7.34 / 16.66 at this height) so the round cap does not poke through. */}
      <path d="M8.3 14.8h7.4" />
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

export function WidgetsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      {/* Three squares and a diamond: the rotated one is what keeps this from reading as a
          four-up grid, which is a different idea. */}
      <rect x="3.4" y="3.4" width="7.2" height="7.2" rx="1.4" />
      <rect x="3.4" y="13.4" width="7.2" height="7.2" rx="1.4" />
      <rect x="13.4" y="13.4" width="7.2" height="7.2" rx="1.4" />
      <path d="M17 2.6 21.4 7 17 11.4 12.6 7Z" />
    </svg>
  );
}
