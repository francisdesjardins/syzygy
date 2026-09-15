import { Link } from '@tanstack/react-router';
import { ExampleCard, ExampleGrid, ExampleSection } from '@/entities/example';
import { PageLayout } from '@/shared/ui/PageLayout';

/** Where a reader lands: what the library is for, and the three shapes the rest of the site takes. */
export function HomePage() {
  return (
    <PageLayout
      title="antumbra"
      description="Bootstrap orchestration for an application made of modules. No framework in the core, no UI, no dependencies. Steps declare what they read; the parallelism is whatever the graph allows."
    >
      <ExampleSection
        title="The problem"
        description="Every front end starts the same way — validate a token, check access, prefetch what the first screen needs, then decide whether to mount at all. Almost nobody orchestrates it."
      >
        <ExampleGrid columns={2}>
          <ExampleCard
            title="A chain of awaits"
            description="Each call waits for one that had nothing to do with it. The critical path is the sum of everything, and the parallelism you could have had is invisible in the code."
          />
          <ExampleCard
            title="A block of promises nobody awaits"
            description="Fired and dropped, with no status, no failure handling, and nothing to read when the app mounts into a half-initialised page."
          />
        </ExampleGrid>
      </ExampleSection>

      <ExampleSection title="Three ways to see it" description="The same library, at three sizes.">
        <ExampleGrid columns={2}>
          <ExampleCard title="One application">
            <p>
              Five steps, the graph they imply, and the run against a clock.{' '}
              <Link to="/getting-started">Open it</Link>.
            </p>
          </ExampleCard>
          <ExampleCard title="Four fragments">
            <p>
              React, Solid, a plain controller and a web component on one page, one of them carrying
              its own copy of the library.{' '}
              <Link to="/microfrontends" search={{ scope: 'page' }}>
                Open it
              </Link>
              .
            </p>
          </ExampleCard>
          <ExampleCard title="With single-spa">
            <p>
              A root config that runs the bootstrap before <code>start()</code>, and two
              applications that get what they need two different ways.{' '}
              <Link to="/single-spa">Open it</Link>.
            </p>
          </ExampleCard>
          <ExampleCard title="The reference">
            <p>
              Every export, generated from the JSDoc the gate validates.{' '}
              <Link to="/api">Open it</Link>.
            </p>
          </ExampleCard>
        </ExampleGrid>
      </ExampleSection>
    </PageLayout>
  );
}
