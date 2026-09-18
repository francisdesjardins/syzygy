import {
  AppButton,
  isOnSite,
  SectionNav,
  SelectionDropdown,
  TokenSwatches,
  TokenTablesProvider,
} from 'corona';
import type { TokenNote } from 'corona';
import { ExampleSection } from '@/entities/example';
import { CodeIcon, PlayArrowIcon } from 'corona/icons';
import { PageLayout } from '@/shared/ui/PageLayout';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';
import styles from '@/pages/skin/ui/SkinPage.module.css';

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
  { id: 'recipes', label: 'Recipes' },
  { id: 'rules', label: 'Rules' },
];

/** Colour tokens, with what each one is *for* — the part a value cannot tell you. */
const PALETTE: readonly TokenNote[] = [
  ['--app-flame', 'A fill. Never text: 3.2:1 on the page.'],
  ['--app-accent', 'The amber you may write in.'],
  ['--app-primary', 'A filled control’s ground.'],
  ['--app-primary-ink', 'What goes on that fill — dark, which is why the hover brightens.'],
  ['--app-primary-hover', 'A filled primary brightens; it never deepens.'],
  ['--app-flame-wash', 'The tint behind a selected or live surface.'],
];

export function SkinPage() {
  return (
    <TokenTablesProvider slots={{ Card: SurfaceCard }}>
      <PageLayout
        title="Our skin"
        description="The six colours this playground is painted in, the controls built from them, and the two rules the palette is held to. Everything under them is penumbra's, and has a playground of its own."
      >
        <SectionNav sections={SECTIONS} />

        <ExampleSection
          id="palette"
          title="Palette"
          description="The six declarations that are antumbra's. Everything else a page is painted with — the surfaces, the three text ranks, the states, the four semantics — comes from the base underneath, which is why three playgrounds can differ in their accent without differing in their ground."
        >
          <TokenSwatches tokens={PALETTE} />
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
          description="Each of these was written down first and broken anyway, so each is a test in skin-layering.test.ts — verified to fail when violated."
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
                  <a href="/playground/design/">Penumbra, layer by layer</a> — where the same base
                  wears two other skins.
                </p>
              ) : null}
            </div>
          </SurfaceCard>
        </ExampleSection>
      </PageLayout>
    </TokenTablesProvider>
  );
}
