import { useState } from 'react';
import { SelectionDropdown } from 'corona/shell';
import type { BootstrapPlan } from 'umbra';
import { CopyButton } from '@/shared/ui/CopyButton';
import { toDot, toGoldenFile, toMermaid } from '@/pages/getting-started/examples/plan-formats';
import styles from '@/pages/getting-started/ui/PlanFormats.module.css';

const FORMATS = {
  mermaid: {
    label: 'Mermaid',
    note: 'GitHub renders this inline in a README, so the boot order documents itself and the diagram is regenerated rather than redrawn.',
    emit: toMermaid,
  },
  dot: {
    label: 'Graphviz DOT',
    note: 'For what Mermaid is bad at: a hundred steps, or a print-quality SVG. The hosted step is dashed, because the phase boundary is the one thing a reader always asks about.',
    emit: toDot,
  },
  golden: {
    label: 'Golden file',
    note: 'Commit it and assert against it. A needs nobody meant to add becomes a review comment instead of a mystery three sprints later.',
    emit: toGoldenFile,
  },
} as const;

type FormatKey = keyof typeof FORMATS;

const KEYS = Object.keys(FORMATS) as readonly FormatKey[];

const isKey = (value: string): value is FormatKey => {
  return KEYS.some((key) => {
    return key === value;
  });
};

/**
 * The drawing above and these three are one object under four coats of paint.
 *
 * The point of the card is that nothing here is a library feature: the same `plan().nodes` the SVG
 * is drawn from produces all of them, and each emitter is short enough to read in one screen. What
 * it argues by existing is that umbra should not ship any of the three — every one knows something
 * about its target that a bootstrapper has no business knowing.
 */
export function PlanFormats(props: { plan: BootstrapPlan | undefined }) {
  const [format, setFormat] = useState<FormatKey>('mermaid');

  if (props.plan === undefined) {
    return null;
  }

  const chosen = FORMATS[format];
  const source = chosen.emit(props.plan);

  return (
    <div>
      <div className={styles['controls']}>
        <SelectionDropdown
          id="plan-format"
          aria-label="Output format"
          value={format}
          data-testid="plan-format"
          onChange={(event) => {
            if (isKey(event.target.value)) {
              setFormat(event.target.value);
            }
          }}
        >
          {KEYS.map((key) => {
            return (
              <option key={key} value={key}>
                {FORMATS[key].label}
              </option>
            );
          })}
        </SelectionDropdown>
        <p className={styles['note']}>{chosen.note}</p>
      </div>

      <div className={styles['frame']}>
        <CopyButton text={source} className={styles['copy']} />
        {/* Focusable because it scrolls: a region a mouse can pan and a keyboard cannot is the
            failure axe calls `scrollable-region-focusable`. */}
        <div
          className={styles['scroll']}
          tabIndex={0}
          role="group"
          aria-label={`${chosen.label} source, scrollable`}
        >
          <pre className={styles['source']} data-testid="plan-format-source">
            {source}
          </pre>
        </div>
      </div>
    </div>
  );
}
