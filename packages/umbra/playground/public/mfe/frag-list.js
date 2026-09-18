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
      run: () => {
        demo.log('list', 'asking for the session');
        return demo.api.session();
      },
    }),
    defineStep({
      id: 'access',
      needs: ['session'],
      scope: demo.scope,
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

const rows = outcome.data['projects:reference'] ?? [];
const list = document.createElement('ul');
list.replaceChildren(
  ...rows.map((name) => {
    const item = document.createElement('li');
    item.textContent = name;
    return item;
  })
);
body.replaceChildren(list, demo.chips(outcome));
demo.log('list', `status ${outcome.status}`);
