import {
  CATEGORIES,
  SPECIFIERS,
  categoriesFor,
  categoryHref,
  findCategory,
  neighboursOf,
  searchSymbols,
  symbolAnchor,
  symbolAt,
  symbolFor,
} from '../model/api-index.js';

/**
 * The index, read out as text a spec can assert on.
 *
 * It is a module of pure lookups over a generated model, so a harness is the cheapest way to reach
 * it: `virtual:api-model` only exists inside a bundler, which is exactly the seam this package was
 * split along.
 */
export function ApiIndexReadout() {
  const bareNameMisses = symbolAt('lib/react', 'useDialog')?.key;
  const byKey = symbolFor('lib/solid#useDialog')?.summary[0]?.text;
  const neighbours = neighboursOf('react');

  return (
    <dl>
      <dt>categories</dt>
      <dd data-testid="categories">
        {CATEGORIES.map((category) => {
          return category.id;
        }).join(' ')}
      </dd>

      <dt>specifiers</dt>
      <dd data-testid="specifiers">{SPECIFIERS.join(' ')}</dd>

      <dt>three symbols share one name</dt>
      <dd data-testid="collisions">
        {searchSymbols('useDialog')
          .map((hit) => {
            return hit.symbol.key;
          })
          .join(' ')}
      </dd>

      <dt>the same name, resolved per specifier</dt>
      <dd data-testid="by-specifier">{bareNameMisses ?? '(none)'}</dd>
      <dd data-testid="by-key">{byKey ?? '(none)'}</dd>

      <dt>routing</dt>
      <dd data-testid="href">{categoryHref('react')}</dd>
      <dd data-testid="anchor">{symbolAnchor('useDialog')}</dd>

      <dt>neighbours of react</dt>
      <dd data-testid="previous">{neighbours.previous?.id ?? '(none)'}</dd>
      <dd data-testid="next">{neighbours.next?.id ?? '(none)'}</dd>

      <dt>ends of the list</dt>
      <dd data-testid="first-previous">{neighboursOf('core').previous?.id ?? '(none)'}</dd>
      <dd data-testid="last-next">{neighboursOf('solid').next?.id ?? '(none)'}</dd>

      <dt>lookups that miss</dt>
      <dd data-testid="unknown-category">{findCategory('nope')?.id ?? '(none)'}</dd>
      <dd data-testid="unknown-key">{symbolFor('lib#nope')?.name ?? '(none)'}</dd>

      <dt>one specifier per category</dt>
      <dd data-testid="categories-for">
        {categoriesFor('lib')
          .map((category) => {
            return category.id;
          })
          .join(' ')}
      </dd>

      <dt>search</dt>
      <dd data-testid="empty-search">{searchSymbols('   ').length}</dd>
      <dd data-testid="summary-not-searched">{searchSymbols('Makes a thing').length}</dd>
    </dl>
  );
}
