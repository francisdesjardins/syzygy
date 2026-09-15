# antumbra

Bootstrap orchestration for an application made of modules. No framework in the core, no UI, no
dependencies.

Every front end starts the same way. Validate a token. Check what this user may do. Prefetch the
configuration and the reference lists the modules will ask for on their first render. Then decide
whether the app may mount at all. Almost nobody orchestrates it, and the two usual shapes are both
bad: a chain of `await` on the critical path, where each call waits for one that had nothing to do
with it, or a block of promises fired and never awaited, with no status and no failure handling.

antumbra takes that work, derives the parallelism from the dependencies you declare, and hands back
a typed result — plus the two things a bootstrap always produces and nobody has anywhere to put:
facts it recorded on the way, and UI work it could not do itself.

```ts
import { createBootstrap, defineStep } from 'antumbra';

const boot = createBootstrap({
  steps: [
    defineStep({
      id: 'session',
      timeout: 3000,
      run: async (ctx) => {
        const session = await validateToken(ctx.signal);
        if (session === null) {
          ctx.intent('redirect:sign-in', { returnTo: location.pathname });
          return ctx.block('No session.');
        }
        return session;
      },
    }),
    defineStep({
      id: 'access',
      needs: ['session'],
      run: async (ctx) => {
        return rolesOf(ctx.get('session').userId);
      },
    }),
    defineStep({
      id: 'config',
      needs: ['session'],
      optional: true,
      run: async (ctx) => {
        return fetchConfig(ctx.signal);
      },
    }),
  ],
});

const outcome = await boot.run();
if (outcome.status === 'ready' || outcome.status === 'degraded') {
  mountTheApp(outcome.data);
}
```

`access` and `config` both depend on `session` and on nothing else, so they go out together. You did
not ask for that and there is no flag for it: it is what the graph you wrote already said.

## What this is for

An application whose modules are separated — a monorepo with one module per domain is the common
case. The session module owns the token, another owns access, two more own reference data they would
otherwise each fetch on first render. Written as a graph, the shared work happens once and the
independent work overlaps.

Deploying those modules separately, as micro-frontends, changes nothing about the graph. That is a
property of the shape rather than the reason for it.

## More than one module on a page

Two modules booting independently — a monorepo where each domain owns its startup, or two
micro-frontends built separately — will each validate the same token and fetch the same
configuration. Mark the step `scope: 'page'` and the first one to reach it does the work; the rest
adopt the result.

```ts
defineStep({
  id: 'session',
  scope: 'page',
  run: async (ctx) => {
    return validateToken(ctx.signal);
  },
});
```

The step id is the sharing key: two modules that declare `session` are declaring the same thing.
Nothing needs to import anything else, which is the point — the registry lives on a versioned
`Symbol.for` so two separately built copies of the library find each other.

A shared step is attempted once and its ending is the page's answer, refusal and timeout included,
so modules that share a step should agree on its `timeout`. Its notices and intents stay with the
run that did the work: replaying them would put the same warning on the screen once per module.
`outcome.timeline` marks an adopted step `shared: true`.

## The two phases

A preflight step runs before anything is mounted. It has no framework and cannot ask the user
anything, and it is the only kind that may refuse the mount outright.

A mounted step runs after a binding has taken over, with a UI port in hand. It can open a dialog and
wait for the answer. It cannot refuse a mount that already happened.

That split is in the types, not in a comment: the two phases get two different context types, so a
preflight step has no `ctx.ui` to reach for and a mounted step has no `ctx.block` to call.

```ts
const trialWarning = defineMountedStep({
  id: 'trial-warning',
  needs: ['config'],
  run: async (ctx) => {
    if (ctx.get('config').daysLeft < 30) {
      await ctx.awaitIntent('warn:trial-expiring', { daysLeft: ctx.get('config').daysLeft });
    }
  },
});
```

## Notices and intents

A **notice** is a fact recorded during the run. Passive: nothing is expected to act on it. It is what
tells you the configuration came from a four-hour-old cache, or that a module's reference data never
arrived. Notices survive the failure of the step that wrote them, because the run that went wrong is
the one whose facts matter.

An **intent** is UI work the framework-free layer cannot do itself. Open a warning dialog, redirect,
ask for a confirmation. It has a life: `pending → forwarded → handled | dropped`. Nothing is
forwarded on its own — the app says what it takes — and an intent nobody forwards is recorded as
dropped with a reason rather than lost.

```ts
const session = boot.session();
const bound = bindBootstrap(session, {
  ui: {
    confirm: (message) => {
      return myDialog.ask(message);
    },
  },
  onIntent: (intent, controls) => {
    if (intent.type === 'redirect:sign-in') {
      controls.drop('handled by the router');
      return;
    }
    myBanner.show(intent, controls.settle);
  },
});
```

## Status

| Status     | Means                             | What the app does                                    |
| ---------- | --------------------------------- | ---------------------------------------------------- |
| `ready`    | Every step succeeded              | Mount everything                                     |
| `degraded` | An optional step failed           | Mount, and read the notices to know what is missing  |
| `blocked`  | A step refused the mount          | Do not mount; the intents say where to send the user |
| `failed`   | A required step failed            | Do not mount                                         |
| `aborted`  | Something outside stopped the run | Usually nothing: the page is going away              |

`run()` never rejects for anything a step did. A step that throws, times out or refuses is reported
through `status`, because the notices and intents collected on the way to that failure are the most
valuable thing the run produced and a rejection would throw them away. Programming mistakes — a
cycle, an unknown dependency, a duplicate id — throw synchronously from `createBootstrap`, before
anything runs.

Calling `run()` twice returns the same outcome and re-runs nothing.

## Types belong to your app

Four interfaces, filled by declaration merging. Declare none and everything still works, with open
ids and `unknown` payloads; declare one and every call site that touches it is typed.

```ts
declare module 'antumbra' {
  interface StepRegistry {
    session: { userId: string; expiresAt: number };
    config: { workspaceName: string; trialDaysLeft: number };
  }
  interface NoticeRegistry {
    'config:from-cache': { ageSeconds: number };
    'boot:offline': void;
  }
  interface IntentRegistry {
    'warn:trial-expiring': { daysLeft: number };
  }
  interface UiPort {
    confirm: (message: string) => Promise<boolean>;
  }
}
```

After that, `ctx.get('session').userId` is a `string`, `ctx.notice('config:from-cache')` is an error
because that notice declares a payload, and `outcome.data.session` needs no narrowing once the status
says `ready`.

## Watching a run happen

The outcome arrives at the end and says what the app may do. It cannot tell you what is taking so
long while the user is looking at a blank page. That is what the event stream is for.

```ts
const stream = boot.events();
const running = boot.run();

for await (const event of stream) {
  if (event.kind === 'step:settle') {
    splash.advance(String(event.trace.id));
  }
}

const outcome = await running;
```

Open it before `run()`: it buffers from the moment it is created and ends on its own at
`run:settle`. There is a push form too — `createBootstrap({ onEvent })` — over the same hub.

The stream reports what is happening, never what it means. Whether the app may mount is the
outcome's answer, and a consumer that reduces these events into its own version of it will drift.

## What else does this

Nothing that covers the whole shape, as far as I can tell. Every ecosystem re-solves a piece of it
at home:

|                                      | Has                                                                             | Lacks                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Angular `provideAppInitializer`      | Async work before bootstrap, in parallel                                        | Angular only, no typed result, no deferred UI                  |
| Nuxt plugins                         | The closest in spirit: declared parallelism and a typed context by augmentation | Nuxt only, no degraded status, no deferred UI                  |
| TanStack Router loaders + `Register` | Typed accumulated context, parallel loading, declaration merging                | Route-scoped, replayed on every navigation                     |
| Luigi `uxManager`                    | A module asks the shell to show an alert, which is the intent idea              | A whole micro-frontend framework, iframe-centric               |
| Effect `Layer`                       | Typed dependency graph, concurrency, errors in the signature                    | A whole paradigm, no bootstrap vocabulary                      |
| `orchestrator`, `p-graph`            | Parallel task graphs                                                            | No accumulated typing, no result model, published a decade ago |

If you know of one I have missed, I would like to hear about it.

## Bindings

The core decides everything; a binding is how your framework subscribes to it and how it owns a
lifetime. React and Solid share five names down to the file they live in, so a team running both
writes the same bootstrap twice with the same words.

```tsx
import { BootstrapProvider, useBootstrapContext, useStepData, useIntentHost } from 'antumbra/react';

const port = {
  confirm: (message: string) => {
    return dialog.ask(message);
  },
};

function Shell({ boot }) {
  return (
    <BootstrapProvider boot={boot}>
      <App />
    </BootstrapProvider>
  );
}

function App() {
  const { stage, outcome } = useBootstrapContext();
  const config = useStepData('config');
  const pending = useIntentHost(port);

  if (stage !== 'settled') {
    return <Splash />;
  }
  return (
    <>
      <h1>{config?.workspaceName}</h1>
      {pending.map(({ intent, controls }) => {
        return <Banner key={intent.id} intent={intent} onOk={controls.settle} />;
      })}
    </>
  );
}
```

`useIntentHost` hands back the intents rather than taking an `onIntent` callback, and that shape is
deliberate. A callback prop is a fresh function on every render, so an effect depending on it would
tear the host down between an intent being forwarded and the user answering it. For the same reason
`ui` has to be stable — module scope or `useMemo` — the way the subscribe function handed to
`useSyncExternalStore` does.

Solid is the same five names plus `fromStore`, with one difference that belongs to the renderer:
**every value is an accessor, so do not destructure what these return.**

```ts
const snapshot = useBootstrap(boot);
const config = useStepData('config');
// snapshot().stage, config()?.workspaceName
```

## Install

```sh
yarn add antumbra
```

Four entry points. `antumbra` is the core and resolves with no framework installed. `antumbra/react`
and `antumbra/solid` are the hook bindings, each reaching only its own framework.
`antumbra/vanilla` is a controller that connects the intent queue to markup you already wrote, with
no framework at all.

## Development

```sh
yarn install
yarn dev            # the playground on :3000
yarn check          # type-check, lint, format, docs
yarn test           # the unit and component suites, both on Playwright
yarn verify:all     # everything above plus the build, the package checks and a browser smoke test
```

Node 24 or newer, Yarn 4 through Corepack.

## License

MIT
