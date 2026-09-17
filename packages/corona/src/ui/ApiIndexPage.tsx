import styles from './ApiIndexPage.module.css';
import type { ApiCategory } from 'virtual:api-model';
import {
  SPECIFIERS,
  SYMBOLS,
  categoriesFor,
  categoryHref,
  symbolAnchor,
  symbolAt,
} from '../model/api-index';
import { ApiLayout } from './ApiLayout';
import { KindBadge } from './KindBadge';
import { RouterLink } from './RouterLink';
import { useSlots, useEntryPoints } from '../slots.tsx';

const CategoryCard = ({ category }: { readonly category: ApiCategory }) => {
  const { SurfaceCard } = useSlots();

  return (
    <RouterLink to={categoryHref(category.id)} className={styles['cardLink']}>
      <SurfaceCard interactive>
        <div className={styles['cardContent']}>
          <div className={styles['cardHeader']}>
            <h3 className={styles['cardTitle']}>{category.label}</h3>
            <span className={styles['count']}>{String(category.symbols.length)}</span>
          </div>

          <p className={styles['blurb']}>{category.blurb}</p>

          <div className={styles['symbolPreview']}>
            {category.symbols.slice(0, 4).map((symbol) => {
              return (
                <span key={symbol.name} className={styles['symbolPreviewName']}>
                  {symbol.name}
                </span>
              );
            })}
            {category.symbols.length > 4 && (
              <span className={styles['count']}>+{String(category.symbols.length - 4)}</span>
            )}
          </div>
        </div>
      </SurfaceCard>
    </RouterLink>
  );
};

const StartHere = () => {
  const { doors } = useEntryPoints();

  return (
    <div className={styles['startRow']}>
      {doors.map(({ specifier, name }) => {
        const symbol = symbolAt(specifier, name);
        if (symbol === undefined) {
          return null;
        }
        return (
          <RouterLink
            key={symbol.key}
            to={categoryHref(symbol.category)}
            hash={symbolAnchor(name)}
            className={styles['startChip']}
          >
            <span className={styles['startSpecifier']}>{specifier}</span>
            {name}
            <KindBadge kind={symbol.kind} />
          </RouterLink>
        );
      })}
    </div>
  );
};

/** The front door: what the package exports, where each lives, and what is public — all of this. */
export const ApiIndexPage = () => {
  const { PageLayout, ExampleSection, ExampleGrid } = useSlots();
  const { blurbs, labels } = useEntryPoints();

  return (
    <PageLayout
      title="API Reference"
      description="Generated from the source by typedoc and rendered with this site's own components, so the reference and the examples read as one document. It regenerates whenever the library changes."
    >
      <ApiLayout>
        <div className={styles['page']}>
          <div className={styles['intro']}>
            <span className={styles['overline']}>Start here</span>
            <StartHere />
            <p className={styles['introBody']}>
              These pages are the whole public surface: {String(SYMBOLS.length)} exports across{' '}
              {String(SPECIFIERS.length)} entry points. Anything internal is excluded from the
              generator, so if a name is not here it is not something the package promises — a type
              mentioned in a signature without a link is an internal shape you never have to name
              yourself.
            </p>
          </div>

          {SPECIFIERS.map((specifier) => {
            return (
              <ExampleSection
                key={specifier}
                title={labels[specifier] ?? specifier}
                description={`${specifier} — ${blurbs[specifier] ?? ''}`}
              >
                <ExampleGrid columns={2}>
                  {categoriesFor(specifier).map((category) => {
                    return <CategoryCard key={category.id} category={category} />;
                  })}
                </ExampleGrid>
              </ExampleSection>
            );
          })}
        </div>
      </ApiLayout>
    </PageLayout>
  );
};
