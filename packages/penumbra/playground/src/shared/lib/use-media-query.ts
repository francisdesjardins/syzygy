import { useEffect, useState } from 'react';

/**
 * A media query as state.
 *
 * Read once on mount rather than during render: the server and the first client pass have no
 * `matchMedia`, and a layout that branches on it during render tears on hydration.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = (): void => {
      setMatches(list.matches);
    };
    update();
    list.addEventListener('change', update);
    return () => {
      list.removeEventListener('change', update);
    };
  }, [query]);

  return matches;
}
