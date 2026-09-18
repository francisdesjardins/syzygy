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
      run: async (ctx) => {
        demo.log('nav', 'asking for the session');
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
        demo.log('nav', 'opening a diagnostics recording');
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
    const verdict = demo.verdictOf(outcome);
    if (verdict !== undefined) {
      // There is nothing to navigate to. The links are not greyed out, they are absent — a boot
      // that cannot start is not a degraded one.
      list.replaceChildren(demo.verdict(outcome));
      chips.replaceChildren(demo.chips(outcome));
      demo.log('nav', verdict.toLowerCase());
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
