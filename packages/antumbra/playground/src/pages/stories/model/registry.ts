import { mountReactStory } from '@/pages/stories/ui/react-story.js';
import { mountSolidStory } from '@/pages/stories/ui/solid-story.js';
// Two harnesses live beside the binding they exercise, under each binding’s own `__tests__`
// folder, reached through the `antumbra/` subpath alias — umbra keeps every harness that way, and
// what one renders is a claim about its module rather than about the playground.
//
// The two bootstrap harnesses above cannot follow them, and the reason is load-bearing: they read
// `ctx.get('session').userId`, which needs this app's `StepRegistry` augmentation. Declaration
// merging is global, so that augmentation inside the library would narrow the ids for every type
// test in the main project — the same reason `type-fixtures/` compiles under a tsconfig of its own.
import { mountNoProviderStory as mountReactNoProvider } from 'antumbra/react/__tests__/no-provider.story.js';
import { mountNoProviderStory as mountSolidNoProvider } from 'antumbra/solid/__tests__/no-provider.story.js';

export type StoryMount = (host: HTMLElement) => () => void;

/**
 * Every harness the component suite can mount, by id.
 *
 * The ids are the contract between this file and the tests in `src/**\/__tests__/*.ct.ts`. A story
 * renamed here and not there fails as a missing element rather than a missing story, which is why
 * the page below says so out loud instead of rendering nothing.
 */
export const stories: Readonly<Record<string, StoryMount>> = {
  'react-bootstrap': mountReactStory,
  'solid-bootstrap': mountSolidStory,
  'react-no-provider': mountReactNoProvider,
  'solid-no-provider': mountSolidNoProvider,
};
