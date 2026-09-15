// The top bar, on the React binding.
//
// It needs one thing — who is signed in — and declares it as a page-scoped step. Nothing here knows
// the other three fragments exist; what they agree on is the id `session`, which is the whole
// contract.
//
// Everything is built with `createElement` rather than the DOM helpers its neighbours use: React
// cannot render a raw DOM node as a child, and handing it one throws before anything paints. The
// three other fragments write to the DOM directly, so they use the helpers; this one cannot.

import { createBootstrap, defineStep } from 'antumbra';
import { BootstrapProvider, useBootstrapContext } from 'antumbra/react';
import { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';

const boot = createBootstrap({
  steps: [
    defineStep({
      id: 'session',
      scope: demo.scope,
      run: () => {
        demo.log('topbar', 'asking for the session');
        return demo.api.session();
      },
    }),
  ],
});

function Name() {
  return h('div', { className: 'frag-name' }, 'Top bar ', h('span', null, 'React binding'));
}

function Chips({ outcome }) {
  return h(
    'div',
    { className: 'chips' },
    outcome.timeline.map((trace) => {
      const adopted = trace.shared === true;
      return h(
        'span',
        { key: trace.id, className: `chip ${adopted ? 'chip-adopted' : 'chip-ran'}` },
        `${trace.id} · ${adopted ? 'adopted' : 'ran it'}`
      );
    })
  );
}

function TopBar() {
  const snapshot = useBootstrapContext();
  const outcome = snapshot.outcome;

  if (outcome === undefined) {
    return h('div', null, h(Name, null), h('div', null, 'Starting…'));
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
