/**
 * Every sample the viewer can show, by key.
 *
 * Read from the real files with `?raw`, never retyped, so a card cannot show code the page is not
 * running. Keys are what an `ExampleCard` names in `codeKey`; a card naming one that is not here
 * says so on screen rather than rendering an empty dialog.
 */
import stepsSource from '@/pages/getting-started/examples/steps.ts?raw';
import fakeApiSource from '@/pages/getting-started/examples/fake-api.ts?raw';
import registrySource from '@/pages/getting-started/examples/registry.d.ts?raw';
import hostSource from '@/pages/getting-started/examples/ui-port.ts?raw';
import scenarioSource from '@/pages/stories/model/scenario.ts?raw';
// The harnesses themselves, so a card on the Test Harnesses page can show the fixture it is
// running rather than only describing it. The two under `umbra/` live beside the binding they
// exercise, which is why they are reached through the subpath alias.
import reactStorySource from '@/pages/stories/ui/react-story.tsx?raw';
import solidStorySource from '@/pages/stories/ui/solid-story.ts?raw';
import reactNoProviderSource from 'umbra/react/__tests__/no-provider.story.tsx?raw';
import solidNoProviderSource from 'umbra/solid/__tests__/no-provider.story.ts?raw';
import {
  host,
  list,
  nav,
  spaDashboard,
  spaHost,
  spaReports,
  spaRoot,
  topbar,
  trial,
} from 'virtual:mfe-sources';
import type { CodeLanguage } from '@/shared/ui/HighlightedCode';

export type CodeSample = { readonly source: string; readonly language: CodeLanguage };

/** Two of these are pages rather than modules, and a page coloured as TSX reads as one long string. */
export const codeSamples: Readonly<Record<string, CodeSample>> = {
  'boot-steps': { source: stepsSource, language: 'tsx' },
  'boot-api': { source: fakeApiSource, language: 'tsx' },
  'boot-registry': { source: registrySource, language: 'tsx' },
  'boot-host': { source: hostSource, language: 'tsx' },
  'story-scenario': { source: scenarioSource, language: 'tsx' },
  'story-react-bootstrap': { source: reactStorySource, language: 'tsx' },
  'story-solid-bootstrap': { source: solidStorySource, language: 'tsx' },
  'story-react-no-provider': { source: reactNoProviderSource, language: 'tsx' },
  'story-solid-no-provider': { source: solidNoProviderSource, language: 'tsx' },
  'mfe-host': { source: host, language: 'markup' },
  'mfe-topbar': { source: topbar, language: 'tsx' },
  'mfe-nav': { source: nav, language: 'tsx' },
  'mfe-list': { source: list, language: 'tsx' },
  'mfe-trial': { source: trial, language: 'tsx' },
  'spa-host': { source: spaHost, language: 'markup' },
  'spa-root': { source: spaRoot, language: 'tsx' },
  'spa-dashboard': { source: spaDashboard, language: 'tsx' },
  'spa-reports': { source: spaReports, language: 'tsx' },
};
