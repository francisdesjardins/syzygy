/**
 * A section title as an anchor id: `'Rendering & events'` becomes `'rendering-events'`.
 *
 * Shared by whatever stamps the id onto a heading and whatever links to it, so the two cannot
 * disagree about one. Three playgrounds each had a copy, two of them identical and the third the
 * same function written differently, which is what a shared idea with no shared home does.
 */
export function sectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\da-z]+/g, '-')
    .replace(/^-|-$/g, '');
}
