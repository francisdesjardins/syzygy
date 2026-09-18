import type { SVGProps } from 'react';

/**
 * The ten glyphs only this playground needs. The ones every playground draws are corona's, and so
 * are the rules all twenty-four are drawn to — stroke, grid and open forms — which these follow so
 * the two sets read as one.
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

export function AutoAwesomeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      {/* Three sparkles at three sizes — a four-point star whose arms are concave, so it reads as
          light rather than as a plus sign. */}
      <path d="M10 4.2c.7 4 1.8 5.1 5.8 5.8-4 .7-5.1 1.8-5.8 5.8-.7-4-1.8-5.1-5.8-5.8 4-.7 5.1-1.8 5.8-5.8Z" />
      <path d="M17.8 14.4c.3 1.8.8 2.3 2.6 2.6-1.8.3-2.3.8-2.6 2.6-.3-1.8-.8-2.3-2.6-2.6 1.8-.3 2.3-.8 2.6-2.6Z" />
      <path d="M18.4 3.4c.2 1.2.5 1.5 1.7 1.7-1.2.2-1.5.5-1.7 1.7-.2-1.2-.5-1.5-1.7-1.7 1.2-.2 1.5-.5 1.7-1.7Z" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.2 2.8 2.8 5.4-6" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function ErrorIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.6v5.2M12 16.4h.01" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16.6v-5.2M12 7.8h.01" />
    </svg>
  );
}

export function LocalFireDepartmentIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      {/* The mascot's flame, reduced: an outer tongue with a curled shoulder, and a small hot core
          sitting low. The core is kept well under half the height — matched to the tongue it turns
          the whole glyph to a scribble by 16px. */}
      <path d="M13 2.5c.3 2.2 1.5 3.5 2.9 5A7.3 7.3 0 0 1 18 12.8a6 6 0 0 1-12 0c0-2.1.9-3.9 2.2-5.2.1 1.4.9 2.3 1.9 2.3 1.2 0 2-1 2-2.6 0-1.6-.6-3.2-1.1-4.8Z" />
      <path d="M12 14.4c1 .9 1.6 1.7 1.6 2.5a1.6 1.6 0 1 1-3.2 0c0-.8.6-1.6 1.6-2.5Z" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      {/* A real cog outline — eight square teeth between a 5.6 root and an 8.15 tip, faceted rather
          than filleted so the corners survive 16px. Drawn as an outline and not as a hub with
          radiating spokes: that construction is `LightModeIcon`, and at a glance the two were the
          same glyph. */}
      <path d="M9.99 6.77 10.44 4h3.12l.45 2.77.27.11 2.28-1.64 2.2 2.2-1.64 2.28.11.27L20 10.44v3.12l-2.77.45-.11.27 1.64 2.28-2.2 2.2-2.28-1.64-.27.11L13.56 20h-3.12l-.45-2.77-.27-.11-2.28 1.64-2.2-2.2 1.64-2.28-.11-.27L4 13.56v-3.12l2.77-.45.11-.27L5.24 7.44l2.2-2.2 2.28 1.64Z" />
      <circle cx="12" cy="12" r="2.9" />
    </svg>
  );
}

export function TuneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h9.3M17.7 7H20M4 17h2.3M10.7 17H20" />
      <circle cx="15.5" cy="7" r="2.2" />
      <circle cx="8.5" cy="17" r="2.2" />
    </svg>
  );
}

export function ViewSidebarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.2" y="4.5" width="17.6" height="15" rx="2.2" />
      <path d="M14.8 4.5v15" />
    </svg>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.2 2.9 19.8h18.2Z" />
      <path d="M12 10v4.2M12 17.2h.01" />
    </svg>
  );
}
