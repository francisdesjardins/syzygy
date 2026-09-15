import { Link } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { type StoryMount, stories } from '@/pages/stories/model/registry.js';

/**
 * The component suite's harness, and a gallery for whoever is reading.
 *
 * A route rather than a second bundler: the stories are built by the playground's own Vite, so the
 * code a test exercises is the code the demo runs rather than a parallel pipeline configured to
 * match.
 */
export function StoriesPage() {
  const id = new URLSearchParams(window.location.search).get('story');
  const mount: StoryMount | undefined = id === null ? undefined : stories[id];

  if (id === null) {
    return (
      <main>
        <h1>Stories</h1>
        <ul>
          {Object.keys(stories).map((story) => {
            return (
              <li key={story}>
                <Link to="/stories" search={{ story }}>
                  {story}
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    );
  }

  if (mount === undefined) {
    return <main data-testid="unknown-story">No story named &quot;{id}&quot;.</main>;
  }

  return <StoryHost mount={mount} id={id} />;
}

function StoryHost({ mount, id }: { mount: StoryMount; id: string }) {
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
