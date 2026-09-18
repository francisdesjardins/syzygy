import { useEffect, useRef } from 'react';
import { ExampleCard } from '@/entities/example/ui/ExampleCard';
import { ExampleGrid } from '@/entities/example/ui/ExampleGrid';
import { ExampleSection } from '@/entities/example/ui/ExampleSection';
import { type StoryMount, stories } from '@/pages/stories/model/registry.js';
import { sectionSlug } from '@/shared/lib/section-slug.js';
import { PageLayout } from 'corona';
import { SectionNav } from 'corona';

/**
 * The component suite's fixtures, rendered live and grouped by what they are trying to prove.
 *
 * A route rather than a second bundler: the stories are built by the playground's own Vite, so the
 * code a test exercises is the code this page runs rather than a parallel pipeline configured to
 * match. Every harness on the page is the one an assertion drives — nothing here is a re-creation.
 *
 * Deep links still work: `?story=<id>` renders that one alone, which is what a failing test's URL
 * should hand you.
 */

type StoryEntry = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly codeKey: string;
};

type StoryGroup = {
  readonly label: string;
  readonly stories: readonly StoryEntry[];
};

const STORY_GROUPS: readonly StoryGroup[] = [
  {
    label: 'A binding booting',
    stories: [
      {
        id: 'react-bootstrap',
        codeKey: 'story-react-bootstrap',
        title: 'React, over the whole loop',
        description:
          'The shared scenario booted through umbra/react: five steps, one of them optional and failing on purpose, and a mounted step that queues an intent and waits. The buttons are the ones the assertions press — settle releases the waiting step, drop rejects it with a reason on the record.',
      },
      {
        id: 'solid-bootstrap',
        codeKey: 'story-solid-bootstrap',
        title: 'Solid, over the same loop',
        description:
          'The same scenario through umbra/solid, rendering the same test ids. The component suite asserts these two produce the same readout, which is the claim that keeps the bindings from drifting apart one release at a time.',
      },
    ],
  },
  {
    label: 'A binding used wrongly',
    stories: [
      {
        id: 'react-no-provider',
        codeKey: 'story-react-no-provider',
        title: 'React: no provider above it',
        description:
          'useBootstrapContext outside a BootstrapProvider. It throws rather than handing back a blank snapshot, because an app rendering on a blank one looks exactly like an app whose bootstrap never finished — forever. The boundary here catches it and prints what it said.',
      },
      {
        id: 'solid-no-provider',
        codeKey: 'story-solid-no-provider',
        title: 'Solid: no provider above it',
        description:
          'The same refusal through Solid, which reaches its context by a different route and so has to prove it separately. An ErrorBoundary renders the message.',
      },
    ],
  },
];

const NAV_SECTIONS = STORY_GROUPS.map((group) => {
  return { id: sectionSlug(group.label), label: group.label };
});

const TOTAL_STORIES = STORY_GROUPS.reduce((total, group) => {
  return total + group.stories.length;
}, 0);

export function StoriesPage() {
  const id = new URLSearchParams(window.location.search).get('story');

  if (id !== null) {
    const mount: StoryMount | undefined = stories[id];
    if (mount === undefined) {
      return <main data-testid="unknown-story">No story named &quot;{id}&quot;.</main>;
    }
    return <StoryHost mount={mount} id={id} />;
  }

  return (
    <PageLayout
      title="Test Harnesses"
      description={`The ${String(TOTAL_STORIES)} fixtures the Playwright component suite drives, rendered live and grouped by what each one is trying to prove. Press anything: every control here is the one an assertion presses. The harnesses live beside the code they exercise — two of them under the binding's own __tests__ folder — and they carry no styling of their own, so what you see is behaviour rather than presentation.`}
    >
      <SectionNav sections={NAV_SECTIONS} />

      {STORY_GROUPS.map((group) => {
        return (
          <ExampleSection key={group.label} title={group.label}>
            <ExampleGrid columns={2}>
              {group.stories.map((story) => {
                const mount = stories[story.id];

                return (
                  <ExampleCard
                    key={story.id}
                    title={story.title}
                    description={story.description}
                    codeKey={story.codeKey}
                    example={
                      mount === undefined ? (
                        <p data-testid="unknown-story">No story named &quot;{story.id}&quot;.</p>
                      ) : (
                        <StoryHost mount={mount} id={story.id} />
                      )
                    }
                  />
                );
              })}
            </ExampleGrid>
          </ExampleSection>
        );
      })}
    </PageLayout>
  );
}

function StoryHost({ mount, id }: { readonly mount: StoryMount; readonly id: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  // Destructured in the signature so the dependency is the function itself rather than the props
  // object it arrived in. Depending on `props` would remount the story on every parent render, and
  // switching the check off would silence it for the next dependency somebody adds too.
  useEffect(() => {
    const host = hostRef.current;
    if (host === null) {
      return;
    }
    return mount(host);
  }, [mount]);

  return <div ref={hostRef} data-testid="story-host" data-story={id} />;
}
