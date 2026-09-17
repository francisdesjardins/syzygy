import type { CSSProperties } from 'react';

import styles from './TokenTables.module.css';
import { useTokens } from '../model/use-tokens.ts';
import { useTokenTables } from '../slots.tsx';
import { GROUP_DEMO, SYSTEM_GROUPS, type SystemGroup } from '../contract.ts';

/**
 * What a scale's value actually does, shown beside the number.
 *
 * A length is a number until something is that long; an easing is a curve until something moves
 * along it. The demo is chosen from the group rather than passed in, because which demonstration
 * fits a family is a fact about the family.
 */
const Demo = ({ name, specimen }: { readonly name: string; readonly specimen: string }) => {
  switch (GROUP_DEMO[groupOf(name)]) {
    case 'specimen': {
      return (
        <span className={styles['specimen']} style={styleFor(name)}>
          {specimen}
        </span>
      );
    }
    case 'width': {
      return <span className={styles['bar']} style={{ width: `var(${name})` }} />;
    }
    case 'corner': {
      return <span className={styles['radiusDemo']} style={{ borderRadius: `var(${name})` }} />;
    }
    case 'motion': {
      return (
        // Focusable so the curve is reachable without a pointer: the whole content of the row is
        // the difference between two ways of crossing it.
        <span className={styles['track']} tabIndex={0}>
          <span className={styles['dot']} style={styleFor(name)} />
        </span>
      );
    }
    case 'none': {
      // A z-index and a sidebar width have nothing to show that the number does not already say.
      return null;
    }
  }
};

/** Which family a name belongs to, so a row can pick its own demonstration. */
function groupOf(name: string): SystemGroup {
  for (const [group, names] of Object.entries(SYSTEM_GROUPS)) {
    if ((names as readonly string[]).includes(name)) {
      return group as SystemGroup;
    }
  }
  return 'layout';
}

/** The property a family is demonstrated through — the one thing that differs inside a demo kind. */
function styleFor(name: string): CSSProperties {
  const group = groupOf(name);
  if (group === 'type') {
    return { fontSize: `var(${name})` };
  }
  if (group === 'leading') {
    return { lineHeight: `var(${name})` };
  }
  if (group === 'tracking') {
    return { letterSpacing: `var(${name})` };
  }
  if (group === 'easing') {
    return { transitionTimingFunction: `var(${name})` };
  }
  return { transitionDuration: `var(${name})` };
}

/**
 * One card, one row per token, for as many of the system families as belong together on a page.
 *
 * The names come from `SYSTEM_GROUPS` rather than from the caller: the system half is the same in
 * every project that imports penumbra, so a page listing them again would be a second source for
 * something it does not own. What the caller decides is which families to show and what sentence
 * the type ramp is set in.
 */
export const TokenScale = ({
  groups,
  specimen = 'Declare, derive, settle',
}: {
  readonly groups: readonly SystemGroup[];
  readonly specimen?: string | undefined;
}) => {
  const { slots } = useTokenTables();
  const names = groups.flatMap((group) => {
    return [...SYSTEM_GROUPS[group]];
  });
  const token = useTokens(names);

  return (
    <slots.Card>
      <div style={{ padding: 'var(--app-space-5)' }}>
        <div className={styles['rows']}>
          {names.map((name) => {
            return (
              <div className={styles['row']} key={name}>
                <span className={styles['rowKey']}>{name}</span>
                <span className={styles['rowValue']}>{token(name)}</span>
                <Demo name={name} specimen={specimen} />
              </div>
            );
          })}
        </div>
      </div>
    </slots.Card>
  );
};
