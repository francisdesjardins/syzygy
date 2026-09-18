import { createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * The gallery contract Playwright's `mount` fixture drives.
 *
 * The same shape antumbra's and umbra's use, with the one difference their hosts explain away: this
 * package has no application to borrow a bundler from. It renders inside three playgrounds and is
 * none of them, so the host is three files that do nothing but mount — no router, no providers, no
 * layout. What a test measures is the component and the sheet it asks for.
 */
type StoryProps = Record<string, unknown>;
type Story = (props: StoryProps) => ReactNode;

/**
 * Every harness, discovered rather than listed.
 *
 * Lazy on purpose: importing them all would run every module-level side effect in the package on
 * every test page, which is a correctness property before it is a speed one.
 */
const LOADERS = import.meta.glob<Record<string, Story>>('../src/**/__tests__/**/*.story.tsx');

const ROOT_ID = 'root';

/**
 * Where each id was found, so a second mount of the same harness costs one import.
 *
 * A file exports several harnesses, so the id cannot name the file and the module has to be looked
 * for. The search stops at the first match, which keeps the common case — a spec mounting the same
 * harness repeatedly — down to the module it actually needs. antumbra generates this map instead;
 * that is worth its generator at a hundred and eighty harnesses and not at a dozen.
 */
const resolved = new Map<string, Story>();

let root: Root | null = null;

/** Render one harness. Reuses the root, so an update reconciles rather than remounts. */
export async function mount({
  story,
  props = {},
}: {
  story: string;
  props?: StoryProps;
}): Promise<void> {
  let component = resolved.get(story);

  if (component === undefined) {
    for (const load of Object.values(LOADERS)) {
      const found = (await load())[story];
      if (found !== undefined) {
        resolved.set(story, found);
        component = found;
        break;
      }
    }
  }

  if (component === undefined) {
    // Rejecting, not rendering nothing: a mistyped id must fail the test that asked for it.
    throw new Error(`Unknown story "${story}" — no harness exports that name.`);
  }

  const host =
    document.getElementById(ROOT_ID) ??
    document.body.appendChild(Object.assign(document.createElement('div'), { id: ROOT_ID }));
  root ??= createRoot(host);
  root.render(createElement(component, props));

  // A frame, so the caller's first query runs against a committed tree.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

/** Tear the harness down. The root is kept: the next mount reconciles into it. */
export function unmount(): Promise<void> {
  root?.render(null);
  return Promise.resolve();
}
