import 'penumbra/tokens.system.css';
import 'penumbra/tokens.skin.base.css';
import './skin.css';

/**
 * The gallery's only entry, and it has one door rather than two.
 *
 * antumbra's and umbra's `main.tsx` fork on `?gallery` because they also boot an application. This
 * package has none, so there is nothing to fork away from — the host exists to mount a harness and
 * does that unconditionally.
 *
 * The three sheets are imported here because a component asking for `var(--app-…)` against nothing
 * renders with the property dropped, silently, and a test measuring colour or spacing would be
 * measuring the browser's defaults rather than this package's.
 */
const { mount, unmount } = await import('./gallery.js');

declare global {
  interface Window {
    mount: typeof mount;
    unmount: typeof unmount;
  }
}

window.mount = mount;
window.unmount = unmount;
