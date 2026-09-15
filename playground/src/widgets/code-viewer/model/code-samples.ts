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
import uiPortSource from '@/pages/getting-started/examples/ui-port.ts?raw';
import scenarioSource from '@/pages/stories/model/scenario.ts?raw';
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
  'boot-ui-port': { source: uiPortSource, language: 'tsx' },
  'story-scenario': { source: scenarioSource, language: 'tsx' },
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
