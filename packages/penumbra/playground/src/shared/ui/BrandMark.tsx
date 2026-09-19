import styles from '@/shared/ui/BrandMark.module.css';

/** The mark in the top bar, and the one thing about that bar that is penumbra's rather than corona's. */
export function BrandMark() {
  return <span className={styles['mark']} aria-hidden="true" />;
}
