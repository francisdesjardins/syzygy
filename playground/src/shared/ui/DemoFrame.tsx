import { type ReactNode, useEffect, useRef, useState } from 'react';
import styles from '@/shared/ui/DemoFrame.module.css';

/** The row above a frame: the links or buttons that decide what the frame loads. */
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

/**
 * A demo that is genuinely another page, in a frame, sized to what it renders.
 *
 * The page inside is deliberately not part of this app: plain HTML, an import map, script tags. A
 * build step that resolved `antumbra` for everything on it would prove nothing about what the
 * import map does — and one fragment's whole point is that it is *not* on the shared build and
 * shares anyway.
 */
export function DemoFrame({
  title,
  src,
  reloadKey,
  initialHeight,
}: {
  readonly title: string;
  readonly src: string;
  /** Changing it remounts the frame, which is the only way to boot the page inside again. */
  readonly reloadKey: string;
  readonly initialHeight: number;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(initialHeight);

  useEffect(() => {
    const frame = frameRef.current;
    if (frame === null) {
      return;
    }
    // Measured from the body rather than the document element: `documentElement.scrollHeight` is
    // never less than its own viewport, which here *is* the frame this sets the height of, so it
    // could grow and never shrink.
    const measure = (): void => {
      const inner = frame.contentDocument?.body;
      if (inner !== undefined) {
        setHeight(inner.scrollHeight + 4);
      }
    };
    const timer = setInterval(measure, 400);
    frame.addEventListener('load', measure);
    return () => {
      clearInterval(timer);
      frame.removeEventListener('load', measure);
    };
  }, []);

  return (
    <iframe
      ref={frameRef}
      key={reloadKey}
      title={title}
      src={src}
      className={styles['frame']}
      // The class name is hashed by the CSS module, so the smoke test needs a hook that survives it.
      data-testid="demo-frame"
      style={{ height }}
    />
  );
}
