import { Link, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { ExampleCard, ExampleGrid, ExampleSection } from '@/entities/example';
import { AppButton } from '@/shared/ui/AppButton';
import { appButtonClass } from '@/shared/ui/button-recipe';
import { DemoControls, DemoFrame, DemoToolbar } from '@/shared/ui/DemoFrame';
import { PageLayout } from '@/shared/ui/PageLayout';
import { SectionNav } from '@/shared/ui/SectionNav';

const INITIAL_HEIGHT = 560;

const SECTIONS = [
  { id: 'the-demo', label: 'The demo' },
  { id: 'its-own-copy', label: 'Its own copy' },
  { id: 'the-distribution', label: 'The distribution' },
] as const;

export function MicrofrontendsPage() {
  // Read from the address, not from state. The frame carries a link of its own — right beside the
  // number it changes — and two controls for one setting disagree the moment either is used.
  const { scope } = useSearch({ from: '/microfrontends' });
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <PageLayout
      title="Four Fragments"
      description="A top bar on the React binding, navigation on Solid, a list on the controller binding, and a panel that is a web component behind a shadow root. None of them imports another; what they agree on is three step ids."
    >
      <SectionNav sections={SECTIONS} />

      <ExampleSection
        id="the-demo"
        title="The demo"
        description="Four fragments all need the session, and three need what the user may reach. With shared scope the first one to ask does it and the rest adopt the answer. Flip it and every fragment does its own."
      >
        <DemoToolbar>
          <DemoControls label="Step scope">
            <Link
              to="/microfrontends"
              search={{ scope: 'shared' }}
              className={appButtonClass({ variant: scope === 'shared' ? 'contained' : 'outlined' })}
            >
              Share what the page has in common
            </Link>
            <Link
              to="/microfrontends"
              search={{ scope: 'instance' }}
              className={appButtonClass({
                variant: scope === 'instance' ? 'contained' : 'outlined',
              })}
            >
              Every fragment does its own
            </Link>
          </DemoControls>
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
          src={`${import.meta.env.BASE_URL}mfe/host.html?scope=${scope}`}
          reloadKey={`${scope}-${String(reloadKey)}`}
          initialHeight={INITIAL_HEIGHT}
        />
      </ExampleSection>

      <ExampleSection
        id="its-own-copy"
        title="The fragment with its own copy of the library"
        description="It does not import antumbra. It imports antumbra-copy, which the host resolves to a second, separately built bundle — a genuinely different module instance. Its chips still say adopted."
      >
        <ExampleGrid columns={2}>
          <ExampleCard
            title="frag-trial.js — a web component on its own build"
            description="Shared scope lives in a registry keyed by Symbol.for on globalThis rather than by module identity, which is why a second compiled copy of the library still finds the work the first one did."
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
            description="createElement rather than JSX, because nothing compiles this file. It writes the same antumbra/react specifier a bundled app would."
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
