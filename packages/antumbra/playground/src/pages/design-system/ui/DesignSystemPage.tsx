import {
  AppButton,
  isOnSite,
  SectionNav,
  SelectionDropdown,
  TokenScale,
  TokenSwatches,
  TokenTablesProvider,
} from 'corona';
import type { TokenNote } from 'corona';
import { ExampleSection } from '@/entities/example';
import { CodeIcon, PlayArrowIcon } from '@/shared/ui/icons';
import { PageLayout } from '@/shared/ui/PageLayout';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';
import styles from '@/pages/design-system/ui/DesignSystemPage.module.css';

/**
 * Penumbra, rendered from Penumbra.
 *
 * Every value is read out of the live document rather than written here, so the page cannot drift
 * from the sheets it describes.
 *
 * **The tables are [`corona`](../../../../../corona)'s and the colour is this project's**, which is
 * the seam the token files already make: the system half is identical in every project that imports
 * penumbra, and the palette is what a project rewrites.
 */

const SECTIONS = [
  { id: 'palette', label: 'Palette' },
  { id: 'semantic', label: 'Semantic' },
  { id: 'type', label: 'Type' },
  { id: 'space', label: 'Space & radii' },
  { id: 'motion', label: 'Motion' },
  { id: 'layout', label: 'Layout & stacking' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'rules', label: 'Rules' },
];

/** Colour tokens, with what each one is *for* — the part a value cannot tell you. */
const PALETTE: readonly TokenNote[] = [
  ['--app-bg', 'The ground. A step under the paper in both schemes.'],
  ['--app-paper', 'Bars, rails, cards.'],
  ['--app-text', 'Body ink.'],
  ['--app-text-secondary', 'Supporting copy.'],
  ['--app-text-tertiary', 'Counts, hints, placeholders — still clears 4.5:1.'],
  ['--app-flame', 'A fill. Never text: 3.2:1 on the page.'],
  ['--app-accent', 'The amber you may write in.'],
  ['--app-primary', 'A filled control’s ground.'],
  ['--app-primary-ink', 'What goes on that fill — dark, which is why the hover brightens.'],
  ['--app-primary-hover', 'A filled primary brightens; it never deepens.'],
  ['--app-flame-wash', 'The tint behind a selected or live surface.'],
  ['--app-divider', 'A layout hairline. Owes no contrast.'],
  ['--app-control-border', "A control's edge. 1.4.11 asks 3:1 of it."],
  ['--app-hover', 'The neutral overlay under a hover.'],
];

const SEMANTIC: readonly TokenNote[] = [
  ['--app-error', 'Destructive and failed states.'],
  ['--app-error-ink', 'What goes on the error fill.'],
  ['--app-ok', 'Succeeded.'],
  ['--app-ok-wash', 'The surface a success badge sits on.'],
  ['--app-info', 'Neutral notice.'],
  ['--app-info-wash', 'The surface an info banner sits on.'],
  ['--app-warn', 'The fourth of the family, and what the API badge asks for on a class.'],
  ['--app-warn-wash', 'The surface that badge sits on.'],
];

export function DesignSystemPage() {
  return (
    <TokenTablesProvider slots={{ Card: SurfaceCard }}>
      <PageLayout
        title="Penumbra"
        description="The design system this playground is built in — read live from the token sheet, so what you see here is what the CSS holds rather than a copy of it. The eclipse the mascot draws: a dark body, a corona around it."
      >
        <SectionNav sections={SECTIONS} />

        <ExampleSection
          id="palette"
          title="Palette"
          description="Eight of these are antumbra's and the rest are the neutral base every project shares. Dark is the designed-for scheme and light is given the same care rather than derived by inversion; components read tokens and never branch on the mode, because the tokens do that."
        >
          <TokenSwatches tokens={PALETTE} />
        </ExampleSection>

        <ExampleSection
          id="semantic"
          title="Semantic"
          description="Each ink pairs with the tinted surface a badge or banner sits on. They are the base's rather than this project's, which is the point of them: a component stops reaching for a literal, and with it stops branching on mode."
        >
          <TokenSwatches tokens={SEMANTIC} />
        </ExampleSection>

        <ExampleSection
          id="type"
          title="Type"
          description="Three voices: the display serif on h1–h3 and the wordmark, the body sans everywhere else, the mono for code, eyebrows and columns of digits. The ramp is ~1.22 off a 15px body."
        >
          <TokenScale groups={['type', 'leading', 'tracking']} specimen="Open, render, close" />
        </ExampleSection>

        <ExampleSection
          id="space"
          title="Space & radii"
          description="A component asks for a step, never a pixel count. An off-scale literal has to say why it is off-scale."
        >
          <TokenScale groups={['space', 'radius']} />
        </ExampleSection>

        <ExampleSection
          id="motion"
          title="Motion"
          description="Never a cubic-bezier literal in a component — and never a transition on colour, since a scheme flip switches backgrounds instantly and would interpolate the outgoing ink across them. Hover a track."
        >
          <TokenScale groups={['easing', 'duration']} />
        </ExampleSection>

        <ExampleSection
          id="layout"
          title="Layout & stacking"
          description="The measurements the shell is assembled from, and the order things paint in. The top layer is above all of these and no z-index reaches it — these rank ordinary content against ordinary content."
        >
          <TokenScale groups={['layout', 'stacking']} />
        </ExampleSection>

        <ExampleSection
          id="recipes"
          title="Recipes"
          description="One recipe per thing. The buttons below are the shell's own; a dialog's interior uses the templates' buttons instead, on purpose. The select is the exception that proves it — one recipe worn on both sides, which is why it reads the template tokens first."
        >
          <SurfaceCard>
            <div
              style={{
                padding: 'var(--app-space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--app-space-5)',
              }}
            >
              <div className={styles['recipeRow']}>
                <AppButton variant="contained">Contained</AppButton>
                <AppButton variant="outlined">Outlined</AppButton>
                <AppButton>Text</AppButton>
                <AppButton variant="contained" color="error">
                  Destructive
                </AppButton>
                <AppButton variant="contained" disabled>
                  Disabled
                </AppButton>
                <AppButton variant="contained" size="small">
                  <CodeIcon width={15} height={15} />
                  Small
                </AppButton>
              </div>

              {/* Each control names its own recipe, the way the buttons above do, so the 4px the
                  default stands taller than `compact` reads as the variant it is. The popup is drawn
                  by the browser outside the page: check this card's dark mode by opening one. */}
              <div className={styles['recipeRow']}>
                <SelectionDropdown id="ds-select-default" aria-label="Default select">
                  <option>Default</option>
                  <option>A second option</option>
                </SelectionDropdown>
                <SelectionDropdown id="ds-select-compact" aria-label="Compact select" compact>
                  <option>Compact</option>
                  <option>A second option</option>
                </SelectionDropdown>
                <SelectionDropdown id="ds-select-disabled" aria-label="Disabled select" disabled>
                  <option>Disabled</option>
                </SelectionDropdown>
              </div>

              {/* `block` is the only one a row cannot show: it is a width, so it needs a width to
                  fill. Boxed at a field's measure rather than the card's, which is where it is worn. */}
              <div style={{ maxWidth: 320 }}>
                <SelectionDropdown id="ds-select-block" aria-label="Full-width select" block>
                  <option>Full width — fills its row</option>
                  <option>A second option</option>
                </SelectionDropdown>
              </div>

              <div className={styles['navSample']}>
                <div className={`${styles['navItem']} ${styles['navItemOn']}`}>
                  <PlayArrowIcon width={17} height={17} />
                  Selected — a lit edge
                </div>
                <div className={styles['navItem']}>
                  <CodeIcon width={17} height={17} />
                  Not selected
                </div>
              </div>
            </div>
          </SurfaceCard>
        </ExampleSection>

        <ExampleSection
          id="rules"
          title="Rules with teeth"
          description="Each of these was written down first and broken anyway, so each is a test in design-system-layering.test.ts — verified to fail when violated."
        >
          <SurfaceCard>
            <div style={{ padding: 'var(--app-space-5)' }}>
              <ul className={styles['rules']}>
                <li>
                  <strong>No shell token inside the templates.</strong> They are copied into apps
                  with no <code>--app-*</code> sheet, where <code>var(--app-ease)</code> makes a
                  whole transition invalid and the dialog stops animating.
                </li>
                <li>
                  <strong>
                    No colour or typeface in <code>tokens.system.css</code>.
                  </strong>{' '}
                  The moment one appears the scale has stopped being portable.
                </li>
                <li>
                  <strong>No Material easing, no MD2 metric.</strong> The transcribed constants are
                  gone and stay gone.
                </li>
                <li>
                  <strong>
                    No transition on <code>color</code>.
                  </strong>{' '}
                  Measured at 1.08:1 mid-flip.
                </li>
                <li>
                  <strong>Colour is measured, not chosen.</strong> Sixteen token pairs in both
                  schemes on every run, and eleven routes × both schemes through a real browser —
                  plus axe-core for ARIA, run with a dialog open as well as closed.
                </li>
              </ul>
              {isOnSite() ? (
                <p className={styles['offsite']}>
                  The half of this that is not antumbra's —{' '}
                  <a href="/design-system">penumbra, layer by layer</a>, where the same base wears
                  two other skins.
                </p>
              ) : null}
            </div>
          </SurfaceCard>
        </ExampleSection>
      </PageLayout>
    </TokenTablesProvider>
  );
}
