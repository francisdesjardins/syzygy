import { PageLayout, SectionNav } from 'corona/shell';
import { TokenScale, TokenSwatches, TokenTablesProvider } from 'corona/tokens';
import type { TokenNote } from 'corona/tokens';
import type { ReactNode } from 'react';

import { SurfaceCard } from 'corona/shell';
import styles from '@/pages/tokens/ui/TokensPage.module.css';

/**
 * Penumbra, rendered from Penumbra.
 *
 * Every value is read out of the live document rather than written here, so the page cannot drift
 * from the sheets it describes. The tables are [`corona`](../../../../../corona)'s — the same ones
 * both sibling playgrounds render, which is what makes this the package's page rather than a third
 * description of it.
 */

const SECTIONS = [
  { id: 'neutrals', label: 'Neutrals' },
  { id: 'semantic', label: 'Semantic' },
  { id: 'type', label: 'Type' },
  { id: 'space', label: 'Space & radii' },
  { id: 'motion', label: 'Motion' },
  { id: 'layout', label: 'Layout & stacking' },
];

/** The base's own names, with what each one is *for* — the part a value cannot tell you. */
const NEUTRALS: readonly TokenNote[] = [
  ['--app-bg', 'The ground. A step under the paper in both schemes.'],
  ['--app-paper', 'Bars, rails, cards.'],
  ['--app-text', 'Body ink.'],
  ['--app-text-secondary', 'Supporting copy.'],
  ['--app-text-tertiary', 'Counts, hints, placeholders — still clears 4.5:1.'],
  ['--app-divider', 'A layout hairline. Owes no contrast.'],
  [
    '--app-control-border',
    'A control edge. WCAG 1.4.11 asks 3:1 of it, which is why it is not the divider.',
  ],
  ['--app-hover', 'The neutral overlay under a hover.'],
  ['--app-selected', 'The overlay under the current row.'],
  ['--app-scrim', 'What dims the page behind a drawer.'],
  ['--app-scrollbar-track', 'The channel a scrollbar runs in.'],
  ['--app-scrollbar-thumb', 'The part of it you drag. On no page at all until this row existed.'],
];

const SEMANTIC: readonly TokenNote[] = [
  ['--app-error', 'Something failed, and a destructive control.'],
  ['--app-error-ink', 'What goes on the error fill.'],
  ['--app-ok', 'Succeeded.'],
  ['--app-ok-wash', 'The surface a success badge sits on.'],
  ['--app-info', 'Neutral notice.'],
  ['--app-info-wash', 'The surface an info banner sits on.'],
  ['--app-warn', 'Degraded — it worked, but not with everything it asked for.'],
  ['--app-warn-wash', 'The surface that badge sits on.'],
];

const Section = ({
  id,
  title,
  description,
  children,
}: {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}) => {
  return (
    <section id={id} className={styles['section']}>
      <h2 className={styles['sectionTitle']}>{title}</h2>
      <p className={styles['sectionDescription']}>{description}</p>
      <SurfaceCard>{children}</SurfaceCard>
    </section>
  );
};

export function TokensPage() {
  return (
    <TokenTablesProvider slots={{ Card: SurfaceCard }}>
      <PageLayout
        title="Tokens"
        description="The two sheets this package ships, read live from the document you are looking at. The neutrals and the semantics are the skin base; everything under Type is the system half, which carries no colour at all."
      >
        <SectionNav sections={SECTIONS} />

        <Section
          id="neutrals"
          title="Neutrals"
          description="tokens.skin.base.css — surfaces, text ranks and states, with no brand in them. A project that restates one of these has forked it silently."
        >
          <TokenSwatches tokens={NEUTRALS} />
        </Section>

        <Section
          id="semantic"
          title="Semantic"
          description="The four meanings and their washes, also the base's. A project inherits them rather than choosing what failure looks like."
        >
          <TokenSwatches tokens={SEMANTIC} />
        </Section>

        <Section
          id="type"
          title="Type"
          description="The ramp, the line heights and the tracking. No typeface is declared here — that is the one thing the system half refuses, and the reason it ports."
        >
          <TokenScale groups={['type', 'leading', 'tracking']} specimen="Declare, layer, settle" />
        </Section>

        <Section
          id="space"
          title="Space & radii"
          description="One spacing scale and one radius family. A component asks for a step, never a pixel count."
        >
          <TokenScale groups={['space', 'radius']} />
        </Section>

        <Section
          id="motion"
          title="Motion"
          description="Three durations and three easings. Never a cubic-bezier literal, and never a transition on colour."
        >
          <TokenScale groups={['easing', 'duration']} />
        </Section>

        <Section
          id="layout"
          title="Layout & stacking"
          description="The measures the shell is built to, and the stacking scale. No two layers share a number — a tie is not an order, it is document position deciding one."
        >
          <TokenScale groups={['layout', 'stacking']} />
        </Section>
      </PageLayout>
    </TokenTablesProvider>
  );
}
