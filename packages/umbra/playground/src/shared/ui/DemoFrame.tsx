import type { CSSProperties, ReactNode } from 'react';
import styles from '@/shared/ui/DemoFrame.module.css';

/**
 * One labelled set of controls above a frame.
 *
 * A group rather than a bare row because the label is what tells a screen reader what the buttons
 * inside it decide — so a control that decides something else gets its own group rather than
 * joining this one under a name that does not describe it.
 */
export function DemoControls({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <div className={styles['controls']} role="group" aria-label={label}>
      {children}
    </div>
  );
}

/** Several groups on one row, so two unrelated settings sit side by side above one frame. */
export function DemoToolbar({ children }: { readonly children: ReactNode }) {
  return <div className={styles['toolbar']}>{children}</div>;
}

/**
 * A demo that is genuinely another page, in a frame of a fixed size.
 *
 * The page inside is deliberately not part of this app: plain HTML, an import map, script tags. A
 * build step that resolved `umbra` for everything on it would prove nothing about what the
 * import map does — and one fragment's whole point is that it is *not* on the shared build and
 * shares anyway.
 *
 * **The frame sets the height; the page inside does not.** It used to be the other way around — a
 * poll every 400ms read the inner `scrollHeight` and resized the frame to it — and the result was
 * the site moving under the reader while the demo booted: four different heights in two seconds,
 * 205px apart, because every fragment that rendered and every line the log added made the document
 * taller. Handing the page a viewport instead is what lets the log scroll in its own panel and the
 * page around it hold still. Under 820px the page inside stacks and grows past this, which is the
 * one place it is allowed to scroll.
 */
export function DemoFrame({
  title,
  src,
  reloadKey,
  height,
}: {
  readonly title: string;
  readonly src: string;
  /** Changing it remounts the frame, which is the only way to boot the page inside again. */
  readonly reloadKey: string;
  /** What the page inside is given, on a desktop. Narrow screens take the one in the stylesheet. */
  readonly height: number;
}) {
  return (
    <iframe
      key={reloadKey}
      title={title}
      src={src}
      className={styles['frame']}
      // The class name is hashed by the CSS module, so the smoke test needs a hook that survives it.
      data-testid="demo-frame"
      style={{ '--frame-height': `${String(height)}px` } as CSSProperties}
    />
  );
}
