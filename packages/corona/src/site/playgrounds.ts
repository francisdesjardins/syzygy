/**
 * The playgrounds, by the slug each is deployed under, and the only place they are named.
 *
 * **A slug is a capability; a name is a package.** The two are kept apart on purpose: a package is
 * renamed the day a better word turns up, and a deployed URL that followed it would break every
 * link anybody kept. `deploy.mjs` says the same thing from the other end — the playgrounds are
 * served by what they demonstrate, "whatever the packages end up being called".
 *
 * **The order is the light, then the eclipse** outward from the middle: first the beads, the light
 * that breaks through at the disc's edge, which the Bead protocol is named after and which a visitor
 * should meet first; then the umbra, the full shadow, the penumbra, the partial one around it, and
 * the antumbra beyond the umbra's tip. Every listing reads off this one, so they cannot each pick an
 * order — and an order with a reason is what stops the next person from picking another.
 *
 * Bead's slug and name are both the protocol's: its demo is built and served from Bead's own
 * repository, at its own domain.
 *
 * **`href` is where the playground is served**, which the drawer links to: `/playground/<slug>/`,
 * but for Bead's demo, at https://beadproto.dev/playground/. The root's `check:capabilities` holds
 * each one on this site to the folder `deploy.mjs` fills, and Bead's to an `https://` address.
 */
export const PLAYGROUNDS = [
  { slug: 'bead', name: 'Bead', href: 'https://beadproto.dev/playground/' },
  { slug: 'boot', name: 'Umbra', href: '/playground/boot/' },
  { slug: 'design', name: 'Penumbra', href: '/playground/design/' },
  { slug: 'dialog', name: 'Antumbra', href: '/playground/dialog/' },
] as const;

export type PlaygroundSlug = (typeof PLAYGROUNDS)[number]['slug'];

/**
 * The site the playgrounds hang off. A syzygy is the alignment of three bodies that causes an eclipse,
 * which is what its landing page shows — and the one name in this repository's table that had no
 * word against it.
 */
export const SITE = { href: '/', name: 'Syzygy' } as const;
