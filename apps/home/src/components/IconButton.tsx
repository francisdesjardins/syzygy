import type { ButtonHTMLAttributes, ReactElement } from 'react';

import styles from './IconButton.module.css';

/**
 * A round hover target around a lone icon.
 *
 * The icon is decorative by construction — every glyph in `icons.tsx` carries `aria-hidden` — so
 * the accessible name is this button's `aria-label`, and callers must pass one.
 */
export function IconButton({
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>): ReactElement {
  const classes = [styles['button'], className ?? ''].filter(Boolean).join(' ');
  // eslint-disable-next-line react/button-has-type -- `type` is defaulted above.
  return <button {...rest} type={type} className={classes} />;
}
