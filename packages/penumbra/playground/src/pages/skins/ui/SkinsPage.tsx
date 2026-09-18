import { PageLayout, SelectionDropdown, SurfaceCard } from 'corona/shell';
import { useTheme } from 'corona/theme';
import { useState } from 'react';

import baseSheet from '../../../../../tokens.skin.base.css?raw';
import replacedSheet from '@/app/styles/skins/replaced.css?raw';
import tintSheet from '@/app/styles/skins/tint.css?raw';
import styles from '@/pages/skins/ui/SkinsPage.module.css';

/**
 * What a skin is, shown rather than described.
 *
 * The same markup renders three times under three layerings. Every value in it is a variable and
 * there is no literal colour in the card at all, so what changes between the states is the sheets
 * and nothing else — which is the claim the package makes.
 *
 * **The sheets are scoped rather than applied.** `:root` is rewritten to the preview's attribute,
 * so a state can replace the base outright without taking the page around it with it.
 */
const scopeSkin = (css: string): string => {
  return css.replaceAll(':root', '[data-penumbra-preview]');
};

type StateId = 'base' | 'tint' | 'replaced';

const STATES: Record<
  StateId,
  { readonly sheets: readonly string[]; readonly chain: string; readonly note: string }
> = {
  base: {
    sheets: [baseSheet],
    chain: 'tokens.system.css → tokens.skin.base.css',
    note: 'Nothing over it. No typeface is declared and neither are the eight brand names, so the type falls back to the page and the card has no colour of its own — which is exactly what this package ships.',
  },
  tint: {
    sheets: [baseSheet, tintSheet],
    chain: 'tokens.system.css → tokens.skin.base.css → a skin',
    note: 'Eleven declarations over the base: three typefaces and the eight colours a project paints itself with. The surfaces, the text ranks and the four semantics are still the base’s, which is the usual shape.',
  },
  replaced: {
    sheets: [replacedSheet],
    chain: 'tokens.system.css → a skin that replaces the base',
    note: 'No base at all. This skin declares the neutral and semantic names itself, so the only thing left underneath is the system half — the scale, the rhythm, the motion and the stacking.',
  },
};

const BRAND_TOKENS = [
  '--app-primary',
  '--app-primary-ink',
  '--app-primary-hover',
  '--app-accent',
  '--app-flame',
  '--app-flame-wash',
  '--app-ring',
] as const;

const OPTIONS = [
  { value: 'base', label: 'The base alone' },
  { value: 'tint', label: 'A skin over it' },
  { value: 'replaced', label: 'The base replaced' },
];

export function SkinsPage() {
  const { scheme } = useTheme();
  const [state, setState] = useState<StateId>('tint');
  const active = STATES[state];

  return (
    <PageLayout
      title="Skins"
      description="One card, three layerings. The markup never changes; only the sheets under it do."
      actions={
        <SelectionDropdown
          id="skins-state"
          aria-label="What is over the base"
          value={state}
          onChange={(event) => {
            setState(event.target.value as StateId);
          }}
        >
          {OPTIONS.map((option) => {
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </SelectionDropdown>
      }
    >
      <p className={styles['chain']}>{active.chain}</p>
      <p className={styles['note']}>{active.note}</p>

      <SurfaceCard>
        {/* The scheme, restated on the preview: the scoped sheets carry
            `[data-penumbra-preview][data-color-scheme='dark']`, so without this attribute here the
            dark half of every skin matches nothing and all three states render light. */}
        <div className={styles['preview']} data-penumbra-preview="" data-color-scheme={scheme}>
          <style>{active.sheets.map(scopeSkin).join('\n')}</style>

          <div className="specimen-card">
            <div className="specimen-row">
              <span className="specimen-mark" aria-hidden="true" />
              <h2 className="specimen-title">One card, nothing else</h2>
            </div>

            <p className="specimen-body">
              The same markup in all three states: every value in it is a variable, and there is no
              literal colour anywhere in it.
            </p>
            <p className="specimen-secondary">
              Secondary text, one rank down — the rank a caption or a hint is written in.
            </p>

            <hr className="specimen-rule" />

            <div className="specimen-row">
              <button type="button" className="specimen-primary">
                Save
              </button>
              <button type="button" className="specimen-outline">
                Cancel
              </button>
              <button type="button" className="specimen-danger">
                Delete
              </button>
            </div>

            <div className="specimen-row">
              <span className="specimen-ring">
                <span className="specimen-dot" aria-hidden="true" />
                Live
              </span>
              <span className="specimen-scrim" aria-hidden="true" />
            </div>

            <div className="specimen-row">
              <span className="specimen-badge" data-tone="ok">
                Ready
              </span>
              <span className="specimen-badge" data-tone="info">
                Note
              </span>
              <span className="specimen-badge" data-tone="warn">
                Careful
              </span>
              <span className="specimen-badge" data-tone="error">
                Failed
              </span>
            </div>

            {/* Each row paints itself with its own token. Reading the values in JavaScript would
                read the *page*'s, not the preview's — and a list of names with nothing to look at
                is a list where no two items differ, which is what this was. */}
            <ul className="specimen-list" aria-label="The names a skin declares">
              {BRAND_TOKENS.map((token) => {
                return (
                  <li key={token}>
                    <span
                      className="specimen-chip"
                      aria-hidden="true"
                      style={{ background: `var(${token})` }}
                    />
                    {token}
                  </li>
                );
              })}
            </ul>

            <p className="specimen-caption">
              Switch the page between light and dark: each state answers for both.
            </p>
          </div>
        </div>
      </SurfaceCard>
    </PageLayout>
  );
}
