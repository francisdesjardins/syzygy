/**
 * The small helpers a playground needs before it needs any chrome.
 *
 * Its own subpath rather than a corner of `corona/shell`: the shell barrel reaches MUI, and an
 * entity importing a six-line slug function should not pull a 200 kB chunk in behind it.
 */

export { sectionSlug } from './section-slug.ts';
export { useMediaQuery } from './use-media-query.ts';
