import { ExampleCard, ExampleGrid, ExampleSection } from '@/entities/example';
import { AppButton } from '@/shared/ui/AppButton';
import { PageLayout } from '@/shared/ui/PageLayout';
import { SectionNav } from '@/shared/ui/SectionNav';
import '@/pages/design-system/ui/design-system.css';

const SECTIONS = [
  { id: 'the-split', label: 'The split' },
  { id: 'colour', label: 'Colour' },
  { id: 'type', label: 'Type' },
  { id: 'space', label: 'Space' },
  { id: 'controls', label: 'Controls' },
] as const;

const INKS = [
  { token: '--app-text', what: 'Body text' },
  { token: '--app-text-secondary', what: 'Secondary text' },
  { token: '--app-text-tertiary', what: 'Counts, hints, placeholders' },
  { token: '--app-accent', what: 'Links, and anything that is ink' },
  { token: '--app-ok', what: 'A success note' },
  { token: '--app-warn', what: 'A warning note' },
  { token: '--app-error', what: 'An error note' },
  { token: '--app-info', what: 'An informational note' },
];

const FILLS = [
  { token: '--app-bg', what: 'The page' },
  { token: '--app-paper', what: 'A card' },
  { token: '--app-primary', what: 'A filled control' },
  { token: '--app-flame', what: 'The ring — a fill, never text' },
  { token: '--app-selected', what: 'A selected row' },
  { token: '--app-hover', what: 'A hovered row' },
];

const TEXT_STEPS = ['xs', 'sm', 'md', 'base', 'lg', 'xl', '2xl', '3xl'];
const SPACE_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 14];

/**
 * Penumbra, as this project uses it.
 *
 * The page exists because a design system nobody can see is a set of files people work around. Every
 * swatch below reads its own token, so a value changed in the skin changes what is on this page — a
 * hand-written hex here would be the first lie.
 */
export function DesignSystemPage() {
  return (
    <PageLayout
      title="Design system"
      description="Penumbra: a portable system half and a skin that gets rewritten per project. This is antumbra's skin over the system its sibling wrote."
    >
      <SectionNav sections={SECTIONS} />

      <ExampleSection
        id="the-split"
        title="The split"
        description="Two files, and which one you are allowed to touch depends on what you are changing."
      >
        <ExampleGrid columns={2}>
          <ExampleCard
            title="tokens.system.css — portable"
            description="Scale, rhythm, motion, stacking. No colour and no typeface, which is the whole point: it was lifted from the sibling project unchanged, and a hex appearing in it would end that. A component asks for a step, never a pixel count."
          />
          <ExampleCard
            title="tokens.skin.css — rewritten"
            description="Palette and typefaces. Two rules carried in the names: --app-flame is a fill and --app-accent is the ink, and a filled control hovers away from its ink — which direction that is depends on the scheme. Measured by scripts/check-contrast.mjs, not chosen by eye."
          />
        </ExampleGrid>
      </ExampleSection>

      <ExampleSection
        id="colour"
        title="Colour"
        description="Every pair below clears its floor in both schemes: 4.5:1 for text, 3:1 for a control edge. The check refused the first dark primary at 4.22:1."
      >
        <ExampleGrid columns={2}>
          <ExampleCard title="Inks" description="Anything that is read. These carry contrast.">
            <ul className="token-list">
              {INKS.map((ink) => {
                return (
                  <li key={ink.token}>
                    <span className="token-ink" style={{ color: `var(${ink.token})` }}>
                      Aa
                    </span>
                    <code>{ink.token}</code>
                    <span className="token-what">{ink.what}</span>
                  </li>
                );
              })}
            </ul>
          </ExampleCard>
          <ExampleCard title="Fills" description="Anything that sits behind something else.">
            <ul className="token-list">
              {FILLS.map((fill) => {
                return (
                  <li key={fill.token}>
                    <span className="token-swatch" style={{ background: `var(${fill.token})` }} />
                    <code>{fill.token}</code>
                    <span className="token-what">{fill.what}</span>
                  </li>
                );
              })}
            </ul>
          </ExampleCard>
        </ExampleGrid>
      </ExampleSection>

      <ExampleSection
        id="type"
        title="Type"
        description="A ramp off a 15px body, and three faces: a serif for display, a grotesque for text, a mono for anything with an identifier or a digit column in it."
      >
        <ExampleGrid>
          <ExampleCard title="The ramp">
            <ul className="token-list">
              {TEXT_STEPS.map((step) => {
                return (
                  <li key={step}>
                    <span style={{ fontSize: `var(--app-text-${step})` }}>The annular ring</span>
                    <code>--app-text-{step}</code>
                  </li>
                );
              })}
            </ul>
          </ExampleCard>
        </ExampleGrid>
      </ExampleSection>

      <ExampleSection
        id="space"
        title="Space"
        description="A 4px grid. An off-scale literal owes a comment saying why — a measured geometry, a platform constant."
      >
        <ExampleGrid>
          <ExampleCard title="The steps">
            <ul className="token-list">
              {SPACE_STEPS.map((step) => {
                return (
                  <li key={step}>
                    <span className="token-bar" style={{ width: `var(--app-space-${step})` }} />
                    <code>--app-space-{step}</code>
                  </li>
                );
              })}
            </ul>
          </ExampleCard>
        </ExampleGrid>
      </ExampleSection>

      <ExampleSection
        id="controls"
        title="Controls"
        description="One button, three variants, and a card. Every panel on every page is that card, so none of them decides again."
      >
        <ExampleGrid>
          <ExampleCard title="Buttons">
            <div className="token-row">
              <AppButton variant="primary">Primary</AppButton>
              <AppButton>Default</AppButton>
              <AppButton variant="ghost">Ghost</AppButton>
              <AppButton disabled>Disabled</AppButton>
            </div>
          </ExampleCard>
        </ExampleGrid>
      </ExampleSection>
    </PageLayout>
  );
}
