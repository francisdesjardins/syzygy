import { ApiHost } from './api-host.js';
import { ApiCategoryPage } from '../ui/ApiCategoryPage.js';
import { ApiIndexPage } from '../ui/ApiIndexPage.js';
import { SymbolSearch } from '../ui/SymbolSearch.js';

/** The map: start-here links and a card per category. */
export function ApiIndex() {
  return (
    <ApiHost at="/api">
      <ApiIndexPage />
    </ApiHost>
  );
}

/** One chapter, with a previous and a next. */
export function ApiChapterMiddle() {
  return (
    <ApiHost at="/api/react">
      <ApiCategoryPage categoryId="react" />
    </ApiHost>
  );
}

/** The first chapter, which has no previous. */
export function ApiChapterFirst() {
  return (
    <ApiHost at="/api/core">
      <ApiCategoryPage categoryId="core" />
    </ApiHost>
  );
}

/** A chapter nobody generated: a URL a reader kept after the category was renamed. */
export function ApiChapterMissing() {
  return (
    <ApiHost at="/api/core">
      <ApiCategoryPage categoryId="ghosts" />
    </ApiHost>
  );
}

/** The search, on its own. */
export function ApiSearch() {
  return (
    <ApiHost at="/api">
      <SymbolSearch placeholder="Search the reference" />
    </ApiHost>
  );
}
