// A single-spa application that was given nothing, and asks for what it needs.
//
// It is loaded when its route first matches, long after the root config ran, so `customProps` could
// not have reached it without the root knowing in advance what it would want. It declares the same
// shared steps instead — `session` and `access`, by the same ids — and adopts the answers the
// root already produced. The request counter does not move.
//
// That is the integration worth showing: single-spa keeps loading and routing, and the application
// stops depending on the shell having anticipated it.

import { createBootstrap, defineStep } from 'umbra';

const boot = createBootstrap({
  steps: [
    defineStep({
      id: 'session',
      scope: 'shared',
      run: () => {
        demo.log('reports', 'asking for the session — nobody handed it one');
        return demo.api.session();
      },
    }),
    defineStep({
      id: 'access',
      needs: ['session'],
      scope: 'shared',
      run: () => {
        demo.log('reports', 'asking what this user may reach');
        return demo.api.access();
      },
    }),
    defineStep({
      id: 'reports:filters',
      needs: ['access'],
      optional: true,
      // Its own, and never shared: another application asking for `reports:filters` would mean
      // something else. Scope is a claim about sameness.
      run: () => {
        demo.log('reports', 'loading its own filters');
        return demo.api.filters();
      },
    }),
  ],
});

const host = () => {
  return document.getElementById('spa-outlet');
};

export async function bootstrap() {
  // Nothing: the work is declared above and run on mount, so a route never visited costs nothing.
}

export async function mount() {
  const outcome = await boot.run();
  const filters = outcome.data['reports:filters'] ?? [];

  const root = document.createElement('div');
  root.className = 'app';
  root.append(
    demo.header('Reports', 'single-spa application · loaded late, given no props'),
    demo.line(`Signed in as ${outcome.data.session.displayName}`),
    demo.line(`Filters: ${filters.join(', ')}`),
    demo.chips(outcome, 'adopted from the page')
  );
  host().replaceChildren(root);
  demo.log('reports', `mounted, status ${outcome.status}`);
}

export async function unmount() {
  host().replaceChildren();
}
