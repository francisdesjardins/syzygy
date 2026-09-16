/** A section title as an anchor id, so a page nav and a heading cannot disagree about one. */
export function sectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\da-z]+/g, '-')
    .replace(/^-|-$/g, '');
}
