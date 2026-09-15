import { useState } from 'react';
import { ExampleCard, ExampleGrid, ExampleSection } from '@/entities/example';
import { AppButton } from '@/shared/ui/AppButton';
import { DemoControls, DemoFrame } from '@/shared/ui/DemoFrame';
import { PageLayout } from '@/shared/ui/PageLayout';
import { SectionNav } from '@/shared/ui/SectionNav';

const INITIAL_HEIGHT = 520;

const SECTIONS = [
  { id: 'the-demo', label: 'The demo' },
  { id: 'the-root-config', label: 'The root config' },
  { id: 'readiness', label: 'Readiness' },
  { id: 'the-applications', label: 'The applications' },
] as const;

/**
 * Integrating with a router that already exists, rather than replacing it.
 *
 * single-spa keeps doing what it is for — loading applications, routing between them, running their
 * lifecycles, reporting what is mounted. What antumbra adds is the work that has to finish before
 * any of that is worth starting, and the typed answer it produces.
 */
export function SingleSpaPage() {
  const [signedOut, setSignedOut] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <PageLayout
      title="With single-spa"
      description="A root config loads two applications through single-spa 6. The bootstrap runs to completion before start(), because its answer is what decides whether starting is the right thing to do at all."
      actions={
        <AppButton
          onClick={() => {
            setReloadKey((previous) => {
              return previous + 1;
            });
          }}
        >
          Reload the frame
        </AppButton>
      }
    >
      <SectionNav sections={SECTIONS} />

      <ExampleSection
        id="the-demo"
        title="The demo"
        description="Dashboard is handed the outcome in customProps — what a root config does today. Reports is route-activated, loads long after the root ran, and was given nothing. Open it and watch the counter: it moves by one, for its own filters."
      >
        <DemoControls label="Session">
          <AppButton
            variant={signedOut ? 'default' : 'primary'}
            onClick={() => {
              setSignedOut(false);
              setReloadKey((previous) => {
                return previous + 1;
              });
            }}
          >
            Signed in
          </AppButton>
          <AppButton
            variant={signedOut ? 'primary' : 'default'}
            onClick={() => {
              setSignedOut(true);
              setReloadKey((previous) => {
                return previous + 1;
              });
            }}
          >
            No session
          </AppButton>
        </DemoControls>
        <DemoFrame
          title="single-spa loading two applications"
          src={`${import.meta.env.BASE_URL}spa/spa.html${signedOut ? '?session=none' : ''}`}
          reloadKey={`${String(signedOut)}-${String(reloadKey)}`}
          initialHeight={INITIAL_HEIGHT}
        />
      </ExampleSection>

      <ExampleSection
        id="the-root-config"
        title="The root config"
        description="With no session the guard refuses, start() is never called, and single-spa is never asked to mount anything — rather than mounting a shell that then has to discover it has nowhere to go."
      >
        <ExampleGrid>
          <ExampleCard
            title="root-config.js"
            description="The order is the whole integration: the bootstrap runs, and only then does registration happen at all. registerApplication has no way to say “do not start”."
            codeKey="spa-root"
          />
        </ExampleGrid>
      </ExampleSection>

      <ExampleSection
        id="readiness"
        title="Readiness stays single-spa's job"
        description="The shell asks the router what is mounted, through single-spa:app-change and getMountedApps(). antumbra answers what the data is, not what is on screen."
      >
        <ExampleGrid>
          <ExampleCard
            title="Why not both"
            description="A library that reimplements its host's signals is a library you now have to keep in step with two sources of truth, and one day they disagree. The same reasoning is why there is no upward “module is ready” channel in the library at all."
          />
        </ExampleGrid>
      </ExampleSection>

      <ExampleSection
        id="the-applications"
        title="The two applications"
        description="The same need, met two ways."
      >
        <ExampleGrid columns={2}>
          <ExampleCard
            title="app-dashboard.js — props from the root"
            description="It gets everything from customProps, which works and is what every root config does. The cost is that the root has to know in advance what each application will want."
            codeKey="spa-dashboard"
          />
          <ExampleCard
            title="app-reports.js — declares and adopts"
            description="Loaded when its route first matched, so no props could have reached it. It declares the same page-scoped steps by the same ids and adopts the answers the root already produced."
            codeKey="spa-reports"
          />
          <ExampleCard
            title="spa.html — the import map"
            description="One build serves antumbra and single-spa to the root and both applications. Two copies of either would be two registries."
            codeKey="spa-host"
          />
        </ExampleGrid>
      </ExampleSection>
    </PageLayout>
  );
}
