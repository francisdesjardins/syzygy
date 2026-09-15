import type { ComponentProps } from 'react';
import { type ButtonVariant, buttonClass } from '@/shared/ui/button-class';

export function AppButton({
  variant = 'default',
  ...rest
}: ComponentProps<'button'> & { readonly variant?: ButtonVariant }) {
  return <button type="button" {...rest} className={buttonClass(variant, rest.className)} />;
}
