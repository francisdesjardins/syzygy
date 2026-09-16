import { useEffect, useRef } from 'react';
import type { Faults } from '@/pages/getting-started/examples/fake-api.js';
import { mountSolidDemo } from '@/pages/getting-started/ui/solid-demo.js';

/**
 * The Solid binding, running inside the React page.
 *
 * Two frameworks on one page, over one library, and neither knows about the other. It is the
 * cheapest proof that the core is the core: the same steps, the same registry declarations and the
 * same four hook names produce the same result on both sides.
 */
export function SolidPanel({ faults, runId }: { faults: Faults; runId: number }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) {
      return;
    }
    return mountSolidDemo(host, faults);
    // `runId` is in here on purpose: a fresh boot on the page has to be a fresh boot on both sides,
    // or this panel would keep showing the previous run's answer.
  }, [faults, runId]);

  return (
    <div className="panel">
      <h2>The same thing, in Solid</h2>
      <p className="prose">
        Rendered by <code>antumbra/solid</code>, mounted into this React page. Two bootstraps, one
        page. The session, access and configuration steps are <code>scope: &apos;page&apos;</code>,
        so whichever side gets there first does the work and the other adopts it — which is why
        there is one trial warning on this page rather than two.
      </p>
      <div ref={hostRef} data-testid="solid-host" />
    </div>
  );
}
