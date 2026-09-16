// A single-spa application that gets everything from `customProps`.
//
// This is what a root config does today, and it is fine: the shell ran the work and handed the
// answer down. What it costs is visible in the next file — the root has to know, in advance, what
// every application will need, and an application loaded later cannot ask for anything.

const host = () => {
  return document.getElementById('spa-outlet');
};

export async function bootstrap() {
  // single-spa calls this once, before the first mount.
}

export async function mount(props) {
  const { outcome } = props;
  const session = outcome.data.session;
  const access = outcome.data.access ?? [];

  const root = document.createElement('div');
  root.className = 'app';
  root.append(
    demo.header('Dashboard', 'single-spa application · props from the root'),
    demo.line(`Signed in as ${session.displayName}`),
    demo.line(`${access.length} permissions, handed down in customProps`),
    demo.chips(outcome, 'nothing of its own')
  );
  host().replaceChildren(root);
  demo.log('dashboard', 'mounted with what the root passed it');
}

export async function unmount() {
  host().replaceChildren();
}
