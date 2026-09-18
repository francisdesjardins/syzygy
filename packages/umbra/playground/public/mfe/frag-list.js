// The project list, on the controller binding.
//
// No framework at all: this file writes its own markup and drives the queue by hand. It declares the
// same two shared steps as its neighbours, plus one of its own — `projects:reference` is this
// module's data, so it is `instance` scope whatever the others are doing, and it is the step you can watch
// run four times if you flip the switch.

import { createBootstrap, defineStep } from 'umbra';
import { bindBootstrap } from 'umbra/plain';

const boot = createBootstrap({
  steps: [
    defineStep({
      id: 'session',
      scope: demo.scope,
      run: async (ctx) => {
        demo.log('list', 'asking for the session');
        const session = await demo.api.session();
        if (session === null) {
          // Declared by all four, and with shared scope run by one. The other three adopt the
          // refusal: a shared step is attempted once whatever its ending is.
          return ctx.block('No session.');
        }
        return session;
      },
    }),
    defineStep({
      id: 'diagnostics',
      needs: ['session'],
      scope: demo.scope,
      run: (ctx) => {
        if (!demo.preview) {
          // Declared by all four and skipped once: a branch that does not apply to this build does
          // not apply for any module on the page either, and a skip is not a failure to adopt.
          return ctx.skip('not a preview build');
        }
        demo.log('list', 'opening a diagnostics recording');
        return demo.api.diagnostics();
      },
    }),
    defineStep({
      id: 'access',
      needs: ['session'],
      scope: demo.scope,
      // Tight on purpose, so the "access hangs" switch produces a timeout rather than a wait.
      timeout: 900,
      run: () => {
        demo.log('list', 'asking what this user may reach');
        return demo.api.access();
      },
    }),
    defineStep({
      id: 'projects:reference',
      needs: ['access'],
      optional: true,
      // Never shared: this list belongs to this module, and another fragment asking for `projects`
      // would mean something else. Scope is a claim about sameness, not a caching trick.
      run: () => {
        demo.log('list', 'prefetching its own reference data');
        return demo.api.projects();
      },
    }),
  ],
});

const host = document.getElementById('list');
host.append(demo.header('Projects', 'controller binding, no framework'));
const body = document.createElement('div');
host.append(body);
body.textContent = 'Starting…';

const outcome = await boot.run();
const live = boot.live();

bindBootstrap(live, {
  host: {},
  onIntent: (intent, controls) => {
    // This fragment shows no dialogs, and says so instead of leaving the intent to rot.
    controls.drop('the project list has nowhere to show this');
    demo.log('list', `dropped ${intent.type}: it has no dialog`);
  },
});

const verdict = demo.verdictOf(outcome);
if (verdict !== undefined) {
  body.replaceChildren(demo.verdict(outcome), demo.chips(outcome));
  demo.log('list', verdict.toLowerCase());
} else {
  const rows = outcome.data['projects:reference'] ?? [];
  const items = document.createElement('ul');
  items.replaceChildren(
    ...rows.map((name) => {
      const item = document.createElement('li');
      item.textContent = name;
      return item;
    })
  );
  body.replaceChildren(items, demo.chips(outcome));
  demo.log('list', `status ${outcome.status}`);
}
