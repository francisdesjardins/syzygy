// The top bar, on the React binding.
//
// It needs one thing — who is signed in — and declares it as a shared step. Nothing here knows
// the other three fragments exist; what they agree on is the id `session`, which is the whole
// contract.
//
// Everything is built with `createElement` rather than the DOM helpers its neighbours use: React
// cannot render a raw DOM node as a child, and handing it one throws before anything paints. The
// three other fragments write to the DOM directly, so they use the helpers; this one cannot.

import { createBootstrap, defineStep } from 'umbra';
import { BootstrapProvider, useBootstrapContext } from 'umbra/react';
import { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';

const boot = createBootstrap({
  steps: [
    defineStep({
      id: 'session',
      scope: demo.scope,
      run: async (ctx) => {
        demo.log('topbar', 'asking for the session');
        const session = await demo.api.session();
        if (session === null) {
          // All four declare this, and with shared scope only one of them ever runs it. The other
          // three adopt the refusal, which is the half of shared scope that is easy to forget:
          // a shared step is attempted once whatever its ending is.
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
        demo.log('topbar', 'opening a diagnostics recording');
        return demo.api.diagnostics();
      },
    }),
  ],
});

function Name() {
  return h('div', { className: 'frag-name' }, 'Top bar ', h('span', null, 'React binding'));
}

// The row the other three build with `demo.chips`, rebuilt as elements — React cannot render a DOM
// node handed to it. What each chip *says* comes off `demo.chipsOf`, so the two spellings cannot
// drift into disagreeing about it.
function Chips({ outcome }) {
  return h(
    'div',
    { className: 'chips' },
    demo.chipsOf(outcome).map((chip) => {
      return h('span', { key: chip.key, className: `chip chip-${chip.kind}` }, chip.text);
    })
  );
}

function TopBar() {
  const snapshot = useBootstrapContext();
  const outcome = snapshot.outcome;

  if (outcome === undefined) {
    return h('div', null, h(Name, null), h('div', null, 'Starting…'));
  }

  const verdict = demo.verdictOf(outcome);
  if (verdict !== undefined) {
    demo.log('topbar', verdict.toLowerCase());
    return h(
      'div',
      null,
      h(Name, null),
      h('div', { className: 'refused' }, verdict),
      h(Chips, { outcome })
    );
  }

  const session = outcome.data.session;
  const adopted = outcome.timeline.some((trace) => {
    return trace.shared === true;
  });
  demo.log('topbar', adopted ? 'adopted the session from the page' : 'did the session itself');

  return h(
    'div',
    null,
    h(Name, null),
    h('div', null, `Signed in as ${session === undefined ? '—' : session.displayName}`),
    h(Chips, { outcome })
  );
}

createRoot(document.getElementById('topbar')).render(
  h(BootstrapProvider, { boot }, h(TopBar, null))
);
