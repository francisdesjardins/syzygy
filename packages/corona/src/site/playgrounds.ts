/**
 * The playgrounds, by the slug each is deployed under, and the only place they are named.
 *
 * **A slug is a capability; a name is a package.** The two are kept apart on purpose: a package is
 * renamed the day a better word turns up, and a deployed URL that followed it would break every
 * link anybody kept. `deploy.mjs` says the same thing from the other end — the playgrounds are
 * served by what they demonstrate, "whatever the packages end up being called".
 */
export const PLAYGROUNDS = [
  { slug: 'dialog', name: 'Antumbra' },
  { slug: 'boot', name: 'Umbra' },
  { slug: 'design', name: 'Penumbra' },
] as const;

export type PlaygroundSlug = (typeof PLAYGROUNDS)[number]['slug'];

/**
 * The site the three hang off. A syzygy is the alignment of three bodies that causes an eclipse,
 * which is what its landing page shows — and the one name in this repository's table that had no
 * word against it.
 */
export const SITE = { href: '/', name: 'Syzygy' } as const;
