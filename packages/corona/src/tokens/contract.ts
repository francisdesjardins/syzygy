import type { ComponentType, ReactNode } from 'react';

/**
 * The one component a token table borrows.
 *
 * Both playgrounds have a card and they are not the same card — one lifts on hover behind a corona,
 * the other is a hairline and a radius. The tables have no opinion about which; they only need
 * something to sit in, so the host lends it the way it lends the API viewer's.
 */
export type TokenSlots = {
  readonly Card: ComponentType<{ readonly children: ReactNode }>;
};

/** A colour token and what it is *for* — the part a resolved value cannot tell you. */
export type TokenNote = readonly [name: string, note: string];

/**
 * The system half's vocabulary, grouped the way a reader wants it rather than the way the sheet
 * declares it. The grouping is editorial and so it is written here; that it is **complete** is not
 * a matter of taste, so `yarn check:tokens` reads `penumbra/tokens.system.css` and fails on a
 * declaration no group claims. A token nobody can see is a token nobody uses.
 *
 * Only the system half. Colour is the consuming project's, and each playground passes its own.
 */
export const SYSTEM_GROUPS = {
  type: [
    '--app-text-xs',
    '--app-text-sm',
    '--app-text-md',
    '--app-text-base',
    '--app-text-lg',
    '--app-text-xl',
    '--app-text-2xl',
    '--app-text-3xl',
  ],
  leading: ['--app-lh-tight', '--app-lh-snug', '--app-lh-body', '--app-lh-relaxed'],
  tracking: ['--app-tracking-tight', '--app-tracking-snug', '--app-tracking-label'],
  space: [1, 2, 3, 4, 5, 6, 8, 10, 12, 14].map((step) => {
    return `--app-space-${String(step)}`;
  }),
  radius: [
    '--app-radius-sm',
    '--app-radius',
    '--app-radius-md',
    '--app-radius-lg',
    '--app-radius-xl',
    '--app-radius-pill',
  ],
  easing: ['--app-ease', '--app-ease-out', '--app-ease-in'],
  duration: ['--app-quick', '--app-duration', '--app-slow'],
  layout: [
    '--app-measure',
    '--app-content-max-width',
    '--app-topbar-height',
    '--app-sidebar-width',
    '--app-scrollbar-width',
    '--app-icon-sm',
  ],
  // Listed bottom to top, and `check-token-coverage.mjs` holds it there: this group is the only
  // one whose order is a claim about the values rather than a reading order, and a page that
  // prints the layers out of sequence tells the reader the opposite of what the sheet does.
  stacking: ['--app-z-mascot', '--app-z-backdrop', '--app-z-sidebar', '--app-z-topbar'],
} as const satisfies Record<string, readonly string[]>;

export type SystemGroup = keyof typeof SYSTEM_GROUPS;

/**
 * How a row demonstrates its value. A scale is only legible next to something the value did: a
 * length as a bar, a radius as a corner, an easing as a thing that moves.
 */
export const GROUP_DEMO = {
  type: 'specimen',
  leading: 'specimen',
  tracking: 'specimen',
  space: 'width',
  radius: 'corner',
  easing: 'motion',
  duration: 'motion',
  layout: 'none',
  stacking: 'none',
} as const satisfies Record<SystemGroup, string>;
