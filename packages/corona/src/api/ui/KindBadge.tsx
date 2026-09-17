import styles from './KindBadge.module.css';
import type { ApiSymbol } from 'virtual:api-model';

/**
 * What a symbol *is*, where the word does not fit. Two accents and a neutral: the palette's
 * `secondary` is the eclipse's body (dark mode's `background.default`), and a type, the quietest
 * kind, reads as the absence of an accent.
 */
const KIND = {
  function: { label: 'fn', tone: 'primary' },
  variable: { label: 'const', tone: 'success' },
  class: { label: 'class', tone: 'warn' },
  type: { label: 'type', tone: 'neutral' },
} as const;

export const KindBadge = ({ kind }: { readonly kind: ApiSymbol['kind'] }) => {
  const { label, tone } = KIND[kind];
  return <span className={`${styles['badge']} ${styles[tone]}`}>{label}</span>;
};
