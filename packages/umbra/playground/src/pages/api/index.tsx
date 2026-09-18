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
import { CodeBlock } from '@/shared/ui/CodeBlock';
import { PageLayout } from 'corona';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';
import { ArrowBackIcon, ArrowForwardIcon, LinkIcon, SearchIcon } from '@/shared/ui/icons';

/**
 * This playground's half of the API reference: the components it lends, and what it is a reference
 * *to*. Everything else — the layout, the rail, the search, the symbol pages — is
 * [corona](../../../../../corona).
 *
 * No adapter is needed here: this code block already names its input `source`, and its language
 * defaults to the one the reference shows.
 */
const SLOTS: ApiSlots = {
  PageLayout,
  SurfaceCard,
  AppButton,
  CodeBlock,
  ExampleSection,
  ExampleGrid,
  icons: { ArrowBackIcon, ArrowForwardIcon, LinkIcon, SearchIcon },
};

/** Doors in: the three calls an application writes, and the one thing it reads back. */
const ENTRY_POINTS: ApiEntryPoints = {
  doors: [
    { specifier: 'umbra', name: 'createBootstrap' },
    { specifier: 'umbra', name: 'defineStep' },
    { specifier: 'umbra', name: 'defineHostedStep' },
    { specifier: 'umbra', name: 'Outcome' },
  ],
  blurbs: {
    umbra:
      'The framework-agnostic core. Plans the work, runs it, and hands back one frozen answer — with no framework installed at all.',
    'umbra/react':
      'Five hooks over the core, which this entry re-exports whole, so a React app imports from this path only.',
    'umbra/solid':
      'The same five names for Solid, plus `fromStore`. Live values are accessors over signals, so do not destructure what these return.',
    'umbra/plain':
      'A controller for markup you wrote yourself: no provider, no hooks, no rendering — and no framework, optional or otherwise.',
  },
  labels: {
    umbra: 'Core',
    'umbra/react': 'React binding',
    'umbra/solid': 'Solid binding',
    'umbra/plain': 'Controller binding',
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
