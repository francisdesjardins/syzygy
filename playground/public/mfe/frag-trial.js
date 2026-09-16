// The trial panel: a web component, behind a shadow root, with its own copy of the library.
//
// **This is the fragment the demo exists for.** It imports `antumbra-copy`, which the host resolves
// to a second, separately built bundle — a genuinely different module instance from the one the
// other three share. It still adopts the session the others share, because shared scope lives in a registry
// keyed by `Symbol.for` on `globalThis` rather than by module identity.
//
// A library that shares through a module singleton cannot do this. Its host has to deduplicate the
// package, and when the host gets that wrong nothing shares and nothing says so.
//
// It also owns the only intent on the page: `config` finds a trial about to expire, queues a
// warning, and a mounted step waits for the answer before this panel considers itself started.

import { createBootstrap, defineHostedStep, defineStep } from 'antumbra-copy';

const boot = createBootstrap({
  steps: [
    defineStep({
      id: 'session',
      scope: demo.scope,
      run: () => {
        demo.log('trial', 'asking for the session');
        return demo.api.session();
      },
    }),
    defineStep({
      id: 'config',
      needs: ['session'],
      scope: demo.scope,
      run: async (ctx) => {
        demo.log('trial', 'asking for the workspace configuration');
        const config = await demo.api.config();
        if (config.trialDaysLeft < 30) {
          ctx.intent('warn:trial-expiring', { daysLeft: config.trialDaysLeft });
        }
        return config;
      },
    }),
    defineHostedStep({
      id: 'trial-warning',
      needs: ['config'],
      run: async (ctx) => {
        if (ctx.get('config').trialDaysLeft < 30) {
          demo.log('trial', 'waiting for someone to acknowledge the warning');
          await ctx.awaitIntent('warn:trial-expiring', {
            daysLeft: ctx.get('config').trialDaysLeft,
          });
          demo.log('trial', 'acknowledged — the hosted step is released');
        }
      },
    }),
  ],
});

class TrialPanel extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    // The shadow boundary keeps the page's stylesheet out, so the panel restates the few rules it
    // needs. Inherited custom properties still cross, which is why the accent matches.
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; }
      .name { font-size: 10px; text-transform: uppercase; letter-spacing: .08em;
              color: var(--trial); font-weight: 700; margin-bottom: 6px; }
      .name span { color: var(--muted); font-weight: 400; text-transform: none; letter-spacing: 0; }
      .warn { color: var(--warn); }
      .chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
      .chip { font-size: 10.5px; padding: 1px 7px; border-radius: 999px;
              border: 1px solid var(--line); color: var(--muted); }
      .chip-ran { border-color: var(--ok); color: var(--ok); }
      .chip-adopted { border-color: var(--accent); color: var(--accent); }
    `;
    const body = document.createElement('div');
    body.textContent = 'Starting…';
    root.append(style, body);
    void this.start(body);
  }

  async start(body) {
    const outcome = await boot.run();
    const session = boot.session();

    // Its own copy of the library, and still the page's session: the chips say `adopted`.
    const config = outcome.data.config;
    const head = document.createElement('div');
    head.className = 'name';
    head.append(document.createTextNode('Trial '));
    const note = document.createElement('span');
    note.textContent = 'web component · shadow root · its own copy of antumbra';
    head.append(note);

    const line = document.createElement('div');
    if (config === undefined) {
      line.textContent = 'No configuration.';
    } else {
      line.className = config.trialDaysLeft < 30 ? 'warn' : '';
      line.textContent = `${config.workspaceName} — ${config.trialDaysLeft} days left`;
    }

    const chips = document.createElement('div');
    chips.className = 'chips';
    for (const trace of outcome.timeline) {
      const chip = document.createElement('span');
      const adopted = trace.shared === true;
      chip.className = `chip ${adopted ? 'chip-adopted' : 'chip-ran'}`;
      chip.textContent = `${trace.id} · ${adopted ? 'adopted' : 'ran it'}`;
      chips.append(chip);
    }

    body.replaceChildren(head, line, chips);

    // This fragment has the page's dialog, so it is the one that hosts the intent.
    session.subscribe(() => {
      for (const intent of session.forward()) {
        void demo
          .ask(`The trial expires in ${intent.payload.daysLeft} days. Acknowledge?`)
          .then((accepted) => {
            if (accepted) {
              session.settle(intent.id);
              return;
            }
            // Dropping is a real answer, not a cancel: `awaitIntent` *rejects* on a drop, so the
            // step that was waiting fails. Saying so here is the point of the demo — the step
            // cannot log it itself, because it never gets past the await.
            session.drop(intent.id, 'declined');
            demo.log('trial', 'declined — the intent is dropped, and the step waiting on it fails');
          });
      }
    });

    await session.attach({});
  }
}

customElements.define('trial-panel', TrialPanel);
