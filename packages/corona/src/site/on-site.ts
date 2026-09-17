/**
 * Whether this build is being served as part of the site around it.
 *
 * A playground is a standalone build: run on its own it is the whole of what a reader can see, and
 * a link to `/design-system` or to `/` would point at a page that is not there. Assembled under
 * `/playground/<capability>/` it is one surface of a larger site, and those links are the only way
 * out of it.
 *
 * Read from where the build is being served rather than from configuration, because a flag would be
 * one more thing the deploy has to set correctly and nothing would notice when it did not.
 */
export const isOnSite = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.location.pathname.startsWith('/playground/');
};
