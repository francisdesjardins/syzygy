// The root config: single-spa loads the applications, antumbra decides what they get.
//
// The order is the whole integration. The bootstrap runs to completion *before* `start()`, because
// its answer is what decides whether starting is the right thing to do at all — a refused session
// means single-spa should never mount anything, and that is a decision no `registerApplication`
// call can express.
//
// Nothing here replaces single-spa. Registration, routing, lifecycles and readiness stay its job;
// what antumbra adds is the work that has to happen first and the typed answer it produces.

import { createBootstrap, defineStep } from 'antumbra';
import { getMountedApps, registerApplication, start } from 'single-spa';

const boot = createBootstrap({
  steps: [
    defineStep({
      id: 'session',
      scope: 'page',
      run: async (ctx) => {
        demo.log('root', 'validating the session before anything mounts');
        const session = await demo.api.session();
        if (session === null) {
          ctx.intent('redirect:sign-in', { returnTo: location.hash });
          return ctx.block('No session.');
        }
        return session;
      },
    }),
    defineStep({
      id: 'access',
      needs: ['session'],
      scope: 'page',
      run: () => {
        demo.log('root', 'asking what this user may reach');
        return demo.api.access();
      },
    }),
    defineStep({
      id: 'config',
      needs: ['session'],
      scope: 'page',
      optional: true,
      run: () => {
        demo.log('root', 'loading the workspace configuration');
        return demo.api.config();
      },
    }),
  ],
});

const outcome = await boot.run();
demo.status(outcome);

// The decision single-spa cannot make for you. `start()` is not called at all, so no application is
// ever asked to mount — rather than mounting a shell that then has to discover it has no session.
if (outcome.status === 'blocked') {
  demo.log('root', `refused: ${outcome.blockedBy.reason} — single-spa was never started`);
  demo.signIn(outcome.intents[0]);
} else {
  const session = boot.session();

  registerApplication({
    name: 'dashboard',
    app: () => {
      return import('./app-dashboard.js');
    },
    activeWhen: (url) => {
      return !url.hash.startsWith('#/reports');
    },
    // The single-spa way: the root threads what it has down to the application. It works, and it is
    // what every root config already does — the cost is that every application in the chain has to
    // carry props it may not use, and a lazily loaded one cannot get them any other way.
    customProps: { outcome, session },
  });

  registerApplication({
    name: 'reports',
    app: () => {
      return import('./app-reports.js');
    },
    activeWhen: (url) => {
      return url.hash.startsWith('#/reports');
    },
    // Deliberately given nothing. It declares the same page-scoped steps itself and adopts what the
    // root already did — which is the point of the second half of this demo.
    customProps: {},
  });

  start();

  // Readiness is single-spa's own signal, and antumbra has no business duplicating it. The shell
  // asks the router what is mounted; the library answers what the data is.
  window.addEventListener('single-spa:app-change', () => {
    demo.mounted(getMountedApps());
  });
}
