import { type AnyStep, type Bootstrap, clearPageScope, createBootstrap } from 'antumbra';
import { BootstrapProvider, useBootstrapContext } from 'antumbra/react';
import { useState } from 'react';
import { ExampleCard, ExampleGrid, ExampleSection } from '@/entities/example';
import { AppButton } from '@/shared/ui/AppButton';
import { PageLayout } from '@/shared/ui/PageLayout';
import { SectionNav } from '@/shared/ui/SectionNav';
import { type Faults, createApi, defaultFaults } from '@/pages/getting-started/examples/fake-api';
import { createSteps } from '@/pages/getting-started/examples/steps';
import { FaultSwitches } from '@/pages/getting-started/ui/FaultSwitches';
import { Glossary } from '@/pages/getting-started/ui/Glossary';
import { IntentHost } from '@/pages/getting-started/ui/IntentHost';
import { OutcomeView } from '@/pages/getting-started/ui/OutcomeView';
import { PlanGraph } from '@/pages/getting-started/ui/PlanGraph';
import { RunChart } from '@/pages/getting-started/ui/RunChart';
import { SolidPanel } from '@/pages/getting-started/ui/SolidPanel';
import { TimelineView } from '@/pages/getting-started/ui/TimelineView';
import '@/pages/getting-started/ui/demo.css';

type Steps = ReturnType<typeof createSteps>;

const SECTIONS = [
  { id: 'the-words', label: 'The words' },
  { id: 'what-you-write', label: 'What you write' },
  { id: 'what-happens', label: 'What happens' },
  { id: 'what-you-get-back', label: 'What you get back' },
  { id: 'two-bootstraps', label: 'Two bootstraps' },
] as const;

function bootFor(faults: Faults): Bootstrap<Steps> {
  return createBootstrap({ steps: createSteps(createApi(faults)) });
}

/** The shape of the graph, read off the same step objects the bootstrap was built from. */
function shapeOf(steps: readonly AnyStep[]) {
  const needsOf: Record<string, readonly string[]> = {};
  const scopeOf: Record<string, string> = {};
  for (const step of steps) {
    needsOf[String(step.id)] = (step.needs ?? []).map((need) => {
      return String(need);
    });
    scopeOf[String(step.id)] = step.scope ?? 'app';
  }
  return { needsOf, scopeOf };
}

function Run(props: { shape: ReturnType<typeof shapeOf>; plan: Bootstrap<Steps>['plan'] }) {
  const snapshot = useBootstrapContext();
  // Both halves. The preflight's traces are frozen into the outcome; the mounted phase's arrive
  // later, on the session, and a graph drawn from the outcome alone leaves its last column
  // permanently unresolved.
  const timeline = [...(snapshot.outcome?.timeline ?? []), ...(snapshot.mount?.timeline ?? [])];

  return (
    <>
      <ExampleSection
        id="what-you-write"
        title="What you write"
        description="Five steps and their dependencies. Nothing here asks for parallelism and there is no flag for it: needs is the only input, and the columns are what it implies."
      >
        <ExampleGrid>
          <ExampleCard
            title="The step graph, as the dependencies drew it"
            description="One column is one level: everything in it goes out together, because nothing in it waits for anything else in it. The second line of each box is its scope, and the last column is the mounted phase."
            codeKey="boot-steps"
            example={
              <PlanGraph
                plan={props.plan()}
                needsOf={props.shape.needsOf}
                scopeOf={props.shape.scopeOf}
                timeline={timeline}
              />
            }
          />
        </ExampleGrid>
      </ExampleSection>

      <ExampleSection
        id="what-happens"
        title="What happens"
        description="Each bar starts when its step was entered and is as wide as it took. Two bars that overlap are two requests in flight at once, which is what the graph bought you."
      >
        <ExampleGrid>
          <ExampleCard
            title="The run against a clock"
            description="A list of events can say two steps succeeded; it cannot say they were in flight at the same time."
            codeKey="boot-api"
            example={<RunChart events={snapshot.events} timeline={timeline} />}
          />
        </ExampleGrid>
      </ExampleSection>

      <ExampleSection
        id="what-you-get-back"
        title="What you get back"
        description="One frozen object. The status is the only thing an app must read to know whether it may mount; everything else explains why."
      >
        <ExampleGrid>
          <ExampleCard
            title="The outcome"
            description="Data keyed by the ids you declared, the facts the run recorded, the UI work it queued, and what went wrong."
            codeKey="boot-registry"
            example={<OutcomeView outcome={snapshot.outcome} intents={snapshot.intents} />}
          />
          <ExampleCard
            title="The raw event stream"
            description="What boot.events() yields, in order. The chart above is this, drawn."
            example={<TimelineView events={snapshot.events} stage={snapshot.stage} />}
          />
        </ExampleGrid>
      </ExampleSection>

      <IntentHost />
    </>
  );
}

export function GettingStartedPage() {
  const [faults, setFaults] = useState<Faults>(defaultFaults);
  // A new bootstrap per run, because a bootstrap is a one-shot object: it memoises its outcome and
  // re-running it would hand back the old answer.
  const [boot, setBoot] = useState<Bootstrap<Steps>>(() => {
    return bootFor(defaultFaults);
  });
  const [runId, setRunId] = useState(0);

  return (
    <PageLayout
      title="One application"
      description="Five steps, two of them optional, one that only runs once a framework has mounted. Flip a switch, boot it again, and watch what changes."
      actions={
        <AppButton
          variant="primary"
          data-testid="boot-again"
          onClick={() => {
            // The page remembers what it has already done, which is the whole point of
            // `scope: 'page'` — and exactly why a demo that boots repeatedly has to forget.
            clearPageScope();
            setBoot(bootFor(faults));
            setRunId((previous) => {
              return previous + 1;
            });
          }}
        >
          Boot again
        </AppButton>
      }
    >
      <SectionNav sections={SECTIONS} />

      <ExampleSection
        id="the-words"
        title="The words"
        description="The five this page uses, defined before it uses them."
      >
        <Glossary />
      </ExampleSection>

      <ExampleSection
        title="Break something on purpose"
        description="Each switch names what to watch change, not only what it breaks."
        id="break-something"
      >
        <FaultSwitches
          faults={faults}
          onChange={(next) => {
            setFaults(next);
          }}
        />
      </ExampleSection>

      <BootstrapProvider key={runId} boot={boot}>
        <Run shape={shapeOf(createSteps(createApi(faults)))} plan={boot.plan} />
      </BootstrapProvider>

      <ExampleSection
        id="two-bootstraps"
        title="Two bootstraps"
        description="The same steps, rendered by antumbra/solid inside this React page. Session, access and configuration are page-scoped, so whichever side gets there first does the work."
      >
        <SolidPanel faults={faults} runId={runId} />
      </ExampleSection>
    </PageLayout>
  );
}
