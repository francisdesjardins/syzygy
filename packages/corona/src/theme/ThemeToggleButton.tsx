import { AppIconButton } from '../shell/AppIconButton.tsx';
import styles from './ThemeToggleButton.module.css';
import { useTheme } from './context.ts';

/* The two glyphs, on the same rules as the drawer's marks: a 24×24 grid, stroke 1.75 on
   `currentColor`, round caps and joins. A sun and a moon rather than a switch, because the control
   shows what a click gets you rather than what is on. */
const base = {
  viewBox: '0 0 24 24',
  width: 20,
  height: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const SunGlyph = () => {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </svg>
  );
};

const MoonGlyph = () => {
  return (
    <svg {...base}>
      <path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.3 8.3 0 1 0 20 14.5Z" />
    </svg>
  );
};

/** Light or dark, written onto the root element where every token reads it. */
export function ThemeToggleButton() {
  const { scheme, toggle } = useTheme();
  const dark = scheme === 'dark';

  return (
    <AppIconButton
      className={styles['toggle']}
      onClick={toggle}
      size="small"
      // The glyph shows what a click gets you, so the name has to say the same thing — otherwise a
      // screen reader hears "dark mode" on the control that turns dark mode off.
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <SunGlyph /> : <MoonGlyph />}
    </AppIconButton>
  );
}
