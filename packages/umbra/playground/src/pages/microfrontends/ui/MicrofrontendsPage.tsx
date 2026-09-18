import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { ExampleCard, ExampleGrid, ExampleSection } from '@/entities/example';
import { AppButton, SectionNav } from 'corona';
import { DemoControls, DemoFrame, DemoToolbar } from '@/shared/ui/DemoFrame';
import { SwitchTable } from '@/shared/ui/SwitchTable';
import { PageLayout } from 'corona';

/*
 * Measured, not chosen: the tallest fragment with every chip it can carry — a skip and its reason
 * on top of the steps it already had — needs this much, and the layout inside is fixed so that the
 * log on the right is the only thing that scrolls.
 */
const FRAME_HEIGHT = 580;

const SECTIONS = [
  { id: 'the-demo', label: 'The demo' },
  { id: 'every-ending', label: 'Every ending' },
  { id: 'its-own-copy', label: 'Its own copy' },
  { id: 'the-distribution', label: 'The distribution' },
] as const;

export function MicrofrontendsPage() {
  // Read from the address, not from state — `readDemoSearch` says why.
  const search = useSearch({ from: '/microfrontends' });
  const { scope, session, preview, access } = search;
  const [reloadKey, setReloadKey] = useState(0);

  const navigate = useNavigate();

  /**
   * The frame's settings, as the same switches the one-application page uses.
   *
   * Checkboxes rather than a row of buttons, and one line each: four settings written as exclusive
   * pairs is eight buttons, which ran out of width and wrapped into a second row nobody reads as a
   * set. They are not alternatives either — a page can have no session *and* a service that stopped
   * answering — so a checkbox is what they actually are.
   *
   * Checked is read from the address rather than from state, because the frame carries links of its
   * own; `readDemoSearch` says why.
   */
  const SETTINGS = [
    {
      key: 'scope',
      label: 'Share what the page has in common',
      watch:
        'the four do one piece of work per step instead of one each, and the counter in the frame is the whole argument',
      checked: scope === 'shared',
      when: { on: 'shared', off: 'instance' },
    },
    {
      key: 'session',
      label: 'No session',
      watch:
        'one fragment finds out and the other three adopt the refusal: one request, and each says which step decided',
      checked: session === 'none',
      when: { on: 'none', off: 'active' },
    },
    {
      key: 'preview',
      label: 'Preview build',
      watch:
        'the diagnostics branch applies and runs; leave it off and one skip answers for all four, with the run still ready',
      checked: preview === 'on',
      when: { on: 'on', off: 'off' },
    },
    {
      key: 'access',
      label: 'Access hangs',
      watch:
        'the step ends on its own timeout, and whoever shared it ends timed-out too — the two that never asked are untouched',
      checked: access === 'hang',
      when: { on: 'hang', off: 'ok' },
    },
  ] as const;

  return (
    <PageLayout
      title="Four Fragments"
      description="A top bar on the React binding, navigation on Solid, a list on the controller binding, and a panel that is a web component behind a shadow root. None of them imports another; what they agree on is three step ids."
    >
      <SectionNav sections={SECTIONS} />

      <ExampleSection
        id="the-demo"
        title="The demo"
        description="Four fragments all need the session, and three need what the user may reach. With shared scope the first one to ask does it and the rest adopt the answer. Flip it and every fragment does its own. The three conditions are the interesting half: a refusal, a branch that does not apply, and a service that stops answering are all endings, and a shared step is attempted once whatever its ending is."
      >
        <SwitchTable
          rows={SETTINGS}
          onToggle={(key, checked) => {
            const setting = SETTINGS.find((candidate) => {
              return candidate.key === key;
            });
            if (setting === undefined) {
              return;
            }
            void navigate({
              to: '/microfrontends',
              search: { ...search, [key]: checked ? setting.when.on : setting.when.off },
              // The switches sit above the frame they drive: scrolling back to the top of the page
              // on every tick puts what you just changed out of view.
              resetScroll: false,
            });
          }}
        />
        <DemoToolbar>
          <DemoControls label="The frame">
            <AppButton
              variant="outlined"
              onClick={() => {
                setReloadKey((previous) => {
                  return previous + 1;
                });
              }}
            >
              Reload the frame
            </AppButton>
          </DemoControls>
        </DemoToolbar>
        <DemoFrame
          title="Four fragments on one page"
          src={`${import.meta.env.BASE_URL}mfe/host.html?scope=${scope}&session=${session}&preview=${preview}&access=${access}`}
          reloadKey={`${scope}-${session}-${preview}-${access}-${String(reloadKey)}`}
          height={FRAME_HEIGHT}
        />
      </ExampleSection>

      <ExampleSection
        id="every-ending"
        title="Every ending, not just the good one"
        description="Sharing is easy to demonstrate when the answer arrives. The conditions above are the other four fifths of what a page actually does."
      >
        <ExampleGrid columns={2}>
          <ExampleCard
            title="No session — a refusal"
            description="One fragment finds out, and the other three adopt the refusal rather than asking again. The counter drops to one request. Each says which step decided and what it gave as the reason; the ones behind it wear the same word with nothing beside it."
          />
          <ExampleCard
            title="Preview build — a branch that does not apply"
            description="The diagnostics branch is declared by all four and skipped once, with its reason. A skip is not a failure: the run stays ready, errors stays empty, and nothing downstream of it runs. Turn the switch on and the same branch boots with nothing else edited."
          />
          <ExampleCard
            title="Access hangs — a timeout"
            description="The step ends on its own budget, and whoever shared it ends timed-out too rather than waiting out a budget of their own. The top bar and the trial panel never declared access, so they are untouched — the ending is everyone's answer, and everyone is whoever asked."
          />
        </ExampleGrid>
      </ExampleSection>

      <ExampleSection
        id="its-own-copy"
        title="The fragment with its own copy of the library"
        description="It does not import umbra. It imports umbra-copy, which the host resolves to a second, separately built bundle — a genuinely different module instance. Its chips still say adopted — and with no session it adopts the refusal, which is the same claim under the ending nobody plans for."
      >
        <ExampleGrid columns={2}>
          <ExampleCard
            title="frag-trial.js — a web component on its own build"
            description="Shared scope lives in a registry keyed by Symbol.for on globalThis rather than by module identity, which is why a second compiled copy of the library still finds the work the first one did — and why one refusal reaches it too, without anything on the page telling it."
            codeKey="mfe-trial"
          />
          <ExampleCard
            title="Why that matters"
            description="Sharing through a module singleton is the better arrangement when you own the host: it can share live objects, not only results. It also fails silently when the host forgets to deduplicate the package, and a page assembled from parts you do not own forgets more often than you would like."
          />
        </ExampleGrid>
      </ExampleSection>

      <ExampleSection
        id="the-distribution"
        title="The distribution"
        description="No bundler runs on the page inside the frame. The import map names ten specifiers, four script tags load the fragments, and the browser resolves the rest."
      >
        <ExampleGrid columns={2}>
          <ExampleCard
            title="host.html — the distribution, all of it"
            description="An import map and four module scripts. This is the file that decides whether the four share a build."
            codeKey="mfe-host"
          />
          <ExampleCard
            title="frag-topbar.js — the React binding"
            description="createElement rather than JSX, because nothing compiles this file. It writes the same umbra/react specifier a bundled app would."
            codeKey="mfe-topbar"
          />
          <ExampleCard
            title="frag-nav.js — the Solid binding"
            description="The same five hook names, with accessors instead of values. It reads access and hides what this user cannot reach."
            codeKey="mfe-nav"
          />
          <ExampleCard
            title="frag-list.js — the controller binding"
            description="No framework at all. It also owns one app-scoped step, which is the one you can watch run four times when sharing is off."
            codeKey="mfe-list"
          />
        </ExampleGrid>
      </ExampleSection>
    </PageLayout>
  );
}
