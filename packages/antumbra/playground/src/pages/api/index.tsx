import {
  ApiCategoryPage as CategoryView,
  ApiIndexPage as IndexView,
  ApiReferenceProvider,
  type ApiSlots,
  type ApiEntryPoints,
} from 'corona';
import { useParams } from '@tanstack/react-router';
import { ExampleGrid, ExampleSection } from '@/entities/example';
import { AppButton } from 'corona';
import { CodeBlock } from '@/shared/ui/CodeBlock/CodeBlock';
import { PageLayout } from 'corona/shell';
import { SurfaceCard } from 'corona/shell';
import { ArrowBackIcon, ArrowForwardIcon, LinkIcon, SearchIcon } from 'corona/icons';

/**
 * This playground's half of the API reference: the components it lends, and what it is a reference
 * *to*. Everything else — the layout, the rail, the search, the symbol pages — is
 * [corona](../../../../../corona).
 *
 * One adapter, for the code block: this one names its input `code` and takes a language, corona's
 * contract names it `source` and only ever shows TSX. Naming the contract after what the page
 * passes rather than after either component is what lets both keep their own.
 */
const SLOTS: ApiSlots = {
  PageLayout,
  SurfaceCard,
  AppButton,
  ExampleSection,
  ExampleGrid,
  CodeBlock: ({ source, wrap }) => {
    return <CodeBlock code={source} wrap={wrap} />;
  },
  icons: { ArrowBackIcon, ArrowForwardIcon, LinkIcon, SearchIcon },
};

/** Doors in, qualified: three bindings export `useDialog`, so bare chips would repeat one word. */
const ENTRY_POINTS: ApiEntryPoints = {
  doors: [
    { specifier: 'antumbra/react', name: 'useDialog' },
    { specifier: 'antumbra/solid', name: 'useDialog' },
    { specifier: 'antumbra/vanilla', name: 'bindDialog' },
    { specifier: 'antumbra', name: 'dialogManager' },
  ],
  blurbs: {
    antumbra: 'The framework-agnostic core. Resolves and runs with no framework installed at all.',
    'antumbra/react':
      'Hooks, the outlet and React-flavoured store access. It re-exports the core, so a React app imports from this path only.',
    'antumbra/solid':
      'The same surface for Solid, plus `fromStore`. Live values are getters over signals, so do not destructure the render args.',
    'antumbra/vanilla':
      'A controller for a <dialog> you wrote yourself: no render, no Dialog, no outlet — and no framework, optional or otherwise.',
  },
  labels: {
    antumbra: 'Core',
    'antumbra/react': 'React binding',
    'antumbra/solid': 'Solid binding',
    'antumbra/vanilla': 'Vanilla binding',
  },
};

export const ApiCategoryPage = () => {
  // The route tree is this app's, so the parameter is read here and handed over. corona renders a
  // category; it does not know which router found it.
  const { category } = useParams({ from: '/api/$category' });

  return (
    <ApiReferenceProvider slots={SLOTS} entryPoints={ENTRY_POINTS}>
      <CategoryView categoryId={category} />
    </ApiReferenceProvider>
  );
};

export const ApiIndexPage = () => {
  return (
    <ApiReferenceProvider slots={SLOTS} entryPoints={ENTRY_POINTS}>
      <IndexView />
    </ApiReferenceProvider>
  );
};
