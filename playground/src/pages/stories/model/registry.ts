import { mountReactStory } from '@/pages/stories/ui/react-story.js';
import { mountSolidStory } from '@/pages/stories/ui/solid-story.js';

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
};
