import styles from './TokenTables.module.css';
import { useTokens } from '../model/use-tokens.ts';
import type { TokenNote } from '../contract.ts';

/**
 * Colour tokens as chips, each painted in the token it names.
 *
 * The chip carries `background: var(--name)` rather than the value the row prints beside it, so the
 * page cannot claim a colour the sheet does not hold — the two would have to disagree visibly for
 * the mistake to exist at all.
 *
 * Which tokens appear is the host's: colour is the half a project rewrites, and the notes are about
 * this product's palette rather than about penumbra's.
 */
export const TokenSwatches = ({ tokens }: { readonly tokens: readonly TokenNote[] }) => {
  const token = useTokens(
    tokens.map(([name]) => {
      return name;
    })
  );

  return (
    <div className={styles['grid']}>
      {tokens.map(([name, note]) => {
        return (
          <div className={styles['swatch']} key={name}>
            <div className={styles['chip']} style={{ background: `var(${name})` }} />
            <div className={styles['meta']}>
              <div className={styles['name']}>{name}</div>
              <div className={styles['value']}>{token(name)}</div>
              <div className={styles['note']}>{note}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
