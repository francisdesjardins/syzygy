import type { ComponentProps } from 'react';
import styles from './AppIconButton.module.css';

/**
 * A round hover target around a lone icon.
 *
 * Every glyph in the set is `aria-hidden`, so the accessible name has to come from this button's
 * `aria-label` — which is why the prop is required rather than optional.
 */
export function AppIconButton({
  size = 'medium',
  className,
  ...rest
}: ComponentProps<'button'> & {
  readonly size?: 'small' | 'medium';
  readonly 'aria-label': string;
}) {
  const classes = [styles['iconButton'], size === 'small' ? styles['small'] : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return <button type="button" {...rest} className={classes} />;
}
