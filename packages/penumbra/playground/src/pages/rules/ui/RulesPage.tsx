import { PageLayout } from 'corona/shell';
import { SurfaceCard } from 'corona/surface';

import styles from '@/pages/rules/ui/RulesPage.module.css';

/** The rules the two sheets are held to, and the gate behind each one. */
const RULES = [
  {
    rule: 'The system half carries no colour and no typeface.',
    why: 'The moment one appears, the file stops being portable: the next project either rewrites it or inherits a palette it never chose.',
    gate: 'check-tokens.mjs — it reads both sheets and fails on a colour or a font family in the system one.',
  },
  {
    rule: 'The base skin carries no brand.',
    why: 'It owes the opposite promise: colour, but nothing a project would recognise as its own. A brand hue landing here is the same failure arriving from the other side.',
    gate: 'check-tokens.mjs, same run, opposite direction.',
  },
  {
    rule: 'No two stacking tokens share a value.',
    why: 'A tie does not order anything — whichever element renders last wins, so the layer a reader sees is decided by a line of markup nobody thought of as a z-index. It cost a mascot sitting over a drawer’s backdrop, eating the tap that closes it.',
    gate: 'check-tokens.mjs, with a guard beside it that fails when the pattern stops matching the scale.',
  },
  {
    rule: 'Every pair a skin creates clears WCAG 2.2 AA.',
    why: 'Colour is the half a project rewrites, which makes it the half a project breaks. Measured rather than reviewed: 32 pairs across both schemes, against the base underneath — a skin measured alone reports on a palette the browser never shows.',
    gate: 'penumbra-contrast, run by every consumer’s `yarn check` as well as this one’s.',
  },
  {
    rule: 'Every token is on a page somebody can read.',
    why: 'A token no page shows is invisible to everyone but the person who wrote it. Eleven of the forty-seven were, the day that check was added.',
    gate: 'corona’s check-token-coverage.mjs, which also holds the stacking group in ascending order.',
  },
];

export function RulesPage() {
  return (
    <PageLayout
      title="Rules"
      description="Five things this package promises, and the gate that fails when one stops being true. A rule without a gate is a preference."
    >
      <ul className={styles['list']}>
        {RULES.map((entry) => {
          return (
            <li key={entry.rule}>
              <SurfaceCard>
                <div className={styles['card']}>
                  <h2 className={styles['rule']}>{entry.rule}</h2>
                  <p className={styles['why']}>{entry.why}</p>
                  <p className={styles['gate']}>
                    <span className={styles['gateLabel']}>Held by</span> {entry.gate}
                  </p>
                </div>
              </SurfaceCard>
            </li>
          );
        })}
      </ul>
    </PageLayout>
  );
}
