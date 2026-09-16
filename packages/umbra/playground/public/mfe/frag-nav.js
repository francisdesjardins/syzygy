// The navigation, on the Solid binding.
//
// It needs the session *and* what this user may reach, so it declares two steps and an edge between
// them. Both are shared: the top bar already asked for the session, so with shared scope this
// fragment adopts it and only `access` actually leaves.
//
// Written with hyperscript rather than JSX, because nothing compiles this file — the same reason the
// React fragment beside it writes `createElement`.

import { createBootstrap, defineStep } from 'umbra';
import { BootstrapProvider, useBootstrapContext } from 'umbra/solid';
import { createComponent, createEffect } from 'solid-js';
import { render } from 'solid-js/web';

const boot = createBootstrap({
  steps: [
    defineStep({
      id: 'session',
      scope: demo.scope,
      run: () => {
        demo.log('nav', 'asking for the session');
        return demo.api.session();
      },
    }),
    defineStep({
      id: 'access',
      needs: ['session'],
      scope: demo.scope,
      run: () => {
        demo.log('nav', 'asking what this user may reach');
        return demo.api.access();
      },
    }),
  ],
});

const ALL = [
  { label: 'Projects', needs: 'projects:read' },
  { label: 'Tags', needs: 'tags:read' },
  { label: 'Reports', needs: 'reports:read' },
  { label: 'Billing', needs: 'billing:write' },
];

function Nav() {
  const snapshot = useBootstrapContext();

  const host = document.createElement('div');
  host.append(demo.header('Navigation', 'Solid binding'));
  const list = document.createElement('ul');
  const chips = document.createElement('div');
  host.append(list, chips);

  createEffect(() => {
    const outcome = snapshot().outcome;
    if (outcome === undefined) {
      list.textContent = 'Starting…';
      return;
    }
    const granted = outcome.data.access ?? [];
    list.replaceChildren(
      ...ALL.map((entry) => {
        const item = document.createElement('li');
        const allowed = granted.includes(entry.needs);
        item.textContent = entry.label;
        item.style.opacity = allowed ? '1' : '0.38';
        if (!allowed) {
          item.title = `needs ${entry.needs}`;
        }
        return item;
      })
    );
    chips.replaceChildren(demo.chips(outcome));
    demo.log(
      'nav',
      `${
        outcome.timeline.filter((trace) => {
          return trace.shared === true;
        }).length
      } of its ${outcome.timeline.length} steps came from the page`
    );
  });

  return host;
}

render(() => {
  return createComponent(BootstrapProvider, {
    boot,
    get children() {
      return createComponent(Nav, {});
    },
  });
}, document.getElementById('nav'));
