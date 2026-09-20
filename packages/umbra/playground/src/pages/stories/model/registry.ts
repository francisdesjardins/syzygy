import { mountReactStory } from '@/pages/stories/ui/react-story.js';
import { mountSolidStory } from '@/pages/stories/ui/solid-story.js';
// The bootstrap harnesses above read `ctx.get('session').userId`, which needs this app's
// `StepRegistry` augmentation, so they cannot sit beside their binding the way these two do:
// merging is global, and that augmentation inside the library would narrow ids for every type
// test there — why `type-fixtures/` has a tsconfig of its own too.
import { mountNoProviderStory as mountReactNoProvider } from 'umbra/react/__tests__/no-provider.story.js';
import { mountNoProviderStory as mountSolidNoProvider } from 'umbra/solid/__tests__/no-provider.story.js';

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
