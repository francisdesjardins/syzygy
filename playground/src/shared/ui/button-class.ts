import styles from '@/shared/ui/AppButton.module.css';

export type ButtonVariant = 'default' | 'primary' | 'ghost';

/**
 * The button's look, without the button.
 *
 * Half the controls on this site navigate, and a navigating control has to be the router's `Link`
 * or it leaves the app on every click. Handing out the class names rather than wrapping `<a>` is
 * what keeps those controls typed against the route tree.
 */
export function buttonClass(variant: ButtonVariant = 'default', extra?: string): string {
  const variantClass = variant === 'default' ? '' : (styles[variant] ?? '');
  return [styles['button'], variantClass, extra].filter(Boolean).join(' ');
}
