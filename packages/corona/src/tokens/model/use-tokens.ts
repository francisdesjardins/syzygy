import { useEffect, useState } from 'react';

/** What the skin keys on, and therefore the one thing worth watching. */
const SCHEME_ATTRIBUTE = 'data-color-scheme';

/**
 * The resolved value of each name, read off the live document and read again when the scheme moves.
 *
 * This is what makes a design-system page a *view* of the stylesheet rather than a second copy of
 * it. A page that restated its own tokens would be right the day it was written and wrong the first
 * time one of them changed, and nothing would say so.
 *
 * **The trigger is the attribute, not the host's state**, and that distinction cost a defect. A
 * theme provider that writes `data-color-scheme` from an ordinary effect writes it *after* its
 * descendants' effects have run, so a table asking React when the scheme changed reads the outgoing
 * scheme's values and keeps them until the next flip. One playground's provider used a layout
 * effect and was right by accident; the other was wrong the whole time. Watching the attribute is
 * true whoever sets it and whenever they do.
 *
 * @param names the custom properties to read, without their `var()`
 * @returns a lookup that answers the empty string for a name the document does not declare
 */
export const useTokens = (names: readonly string[]): ((name: string) => string) => {
  const [read, setRead] = useState<Record<string, string>>({});

  // Spread into a string rather than listed as a dependency: a caller building the array inline
  // would otherwise re-run this on every render, and the array's *contents* are what matter.
  const key = names.join(',');

  useEffect(() => {
    const measure = (): void => {
      const computed = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const name of key.split(',')) {
        next[name] = computed.getPropertyValue(name).trim();
      }
      // The external system is the CSS cascade: a custom property has no resolved value until the
      // DOM is committed, so this cannot be derived during render.
      // oxlint-disable-next-line react/set-state-in-effect
      setRead(next);
    };

    measure();
    const observer = new MutationObserver(measure);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [SCHEME_ATTRIBUTE],
    });
    return () => {
      observer.disconnect();
    };
  }, [key]);

  return (name: string) => {
    return read[name] ?? '';
  };
};
