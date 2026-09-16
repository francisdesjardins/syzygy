import { useEffect, useState } from 'react';
import { AppIconButton } from '@/shared/ui/AppIconButton';
import { CheckIcon, ContentCopyIcon } from '@/shared/ui/icons';
import styles from '@/shared/ui/CopyButton.module.css';

const CONFIRMATION_MS = 2000;

/**
 * Copy, and say so for two seconds.
 *
 * The tick is state rather than a transition class because the label changes with it: the glyph is
 * `aria-hidden`, so "Code copied" on the button is the only announcement a screen reader gets.
 */
export function CopyButton({
  text,
  className,
}: {
  readonly text: string;
  readonly className?: string | undefined;
}) {
  const [copied, setCopied] = useState(false);

  // Cleared on unmount as well as on time: the dialog this sits in closes while the timer is still
  // pending, and a setState after that is a leak the console reports rather than a crash.
  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => {
      setCopied(false);
    }, CONFIRMATION_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [copied]);

  return (
    <AppIconButton
      size="small"
      aria-label={copied ? 'Code copied' : 'Copy code'}
      className={[styles['button'], className].filter(Boolean).join(' ')}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
        });
      }}
    >
      {copied ? <CheckIcon className={styles['done']} /> : <ContentCopyIcon />}
    </AppIconButton>
  );
}
