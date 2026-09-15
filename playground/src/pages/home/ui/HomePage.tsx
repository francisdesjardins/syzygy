import { Link } from '@tanstack/react-router';
import { useTheme } from '@/shared/lib/theme-context';
import { AntumbraMoon } from '@/shared/ui/AntumbraMoon';
import { appButtonClass } from '@/shared/ui/button-recipe';
import { CodeBlock } from '@/shared/ui/CodeBlock';
import styles from '@/pages/home/ui/HomePage.module.css';

const REPO = 'https://github.com/francisdesjardins/antumbra';

const GETTING_IT = `# Not published. Lift the source, or point a dependency at the commit.
git clone ${REPO}
cd antumbra && corepack enable && yarn install`;

const HELLO = `import { createBootstrap, defineStep } from 'antumbra';

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
    // Both need the session and nothing else, so both go out together. You did
    // not ask for that and there is no flag for it: the graph already said so.
    defineStep({ id: 'access', needs: ['session'], run: readAccess }),
    defineStep({ id: 'config', needs: ['session'], optional: true, run: readConfig }),
  ],
});

const outcome = await boot.run();
if (outcome.status === 'ready' || outcome.status === 'degraded') {
  mountTheApp(outcome.data);
}`;

const NEXT = [
  {
    to: '/getting-started',
    title: 'Start here',
    body: 'Five steps, the graph they imply, and the run against a clock — with switches that break things on purpose.',
  },
  {
    to: '/microfrontends',
    title: 'More than one module',
    body: 'Four fragments on one page, one carrying its own compiled copy of the library and sharing anyway.',
  },
  {
    to: '/single-spa',
    title: 'Inside a host that already exists',
    body: 'A root config that runs the bootstrap before start(), and two applications that get what they need two different ways.',
  },
  {
    to: '/api',
    title: 'API reference',
    body: 'Every export, generated from the JSDoc the gate validates.',
  },
] as const;

/** Where a reader lands: what the library is for, and the shapes the rest of the site takes. */
export function HomePage() {
  const { scheme } = useTheme();

  return (
    <div className={styles['page']}>
      <div className={styles['hero']}>
        <div className={styles['heroArt']}>
          <div className={styles['heroArtDisc']}>
            <AntumbraMoon isDark={scheme === 'dark'} breathing />
          </div>
        </div>

        <div className={styles['heroText']}>
          <h1 className={styles['heroTitle']}>
            <span className={`${styles['mark']} ${styles['markWide']}`} aria-hidden="true" />
            <span className={`${styles['mark']} ${styles['markNarrow']}`} aria-hidden="true" />
            Antumbra
          </h1>
          <p className={styles['heroSubtitle']}>
            Bootstrap orchestration for an application made of modules.
          </p>
          <p className={styles['heroBody']}>
            Every front end starts the same way: validate a token, check what this user may do,
            prefetch what the first screen will ask for, then decide whether to mount at all. Almost
            nobody orchestrates it, and the two usual shapes are both bad — a chain of awaits where
            each call waits on one that had nothing to do with it, or a block of promises nobody
            awaits, with no status and no failure handling.
          </p>
          <p className={styles['heroBody']}>
            antumbra takes that work, derives the parallelism from the dependencies you declared,
            and hands back a typed result — plus the two things a bootstrap always produces and
            nobody has anywhere to put: the facts it recorded on the way, and the UI work it could
            not do itself.
          </p>

          <div className={styles['chipRow']}>
            <span className={styles['chip']}>0 runtime dependencies</span>
            <span className={styles['chip']}>no framework in the core</span>
            <span className={styles['chip']}>React · Solid · vanilla</span>
            <span className={styles['chip']}>parallelism derived, never declared</span>
            <span className={styles['chip']}>typed outcome by augmentation</span>
            <span className={styles['chip']}>two phases, typed apart</span>
            <span className={styles['chip']}>Node 24 · ES2023 *</span>
          </div>

          <p className={styles['floorNote']}>
            * The floor is the toolchain's, not the library's: the published bundle is plain ES
            modules with no runtime dependency to pin anyone to a version.{' '}
            <code>scope: 'page'</code> keys its registry off <code>Symbol.for</code> on{' '}
            <code>globalThis</code>, which is the one global this package uses and the reason a
            second compiled copy still shares.
          </p>

          <div className={styles['ctaRow']}>
            <Link to="/getting-started" className={appButtonClass({ variant: 'contained' })}>
              Watch a run
            </Link>
            <Link to="/api" className={appButtonClass({ variant: 'outlined' })}>
              The reference
            </Link>
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className={appButtonClass({ variant: 'outlined' })}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Stacked, not side by side: at half width both snippets get a horizontal scrollbar. */}
      <div className={styles['snippets']}>
        <div className={styles['snippet']}>
          <p className={styles['overline']}>
            <span className={styles['overlineMark']} aria-hidden="true" />
            Getting it
          </p>
          <CodeBlock source={GETTING_IT} language="bash" />
        </div>
        <div className={styles['snippet']}>
          <p className={styles['overline']}>
            <span className={styles['overlineMark']} aria-hidden="true" />
            The whole API of a three-step bootstrap
          </p>
          <CodeBlock source={HELLO} language="tsx" />
        </div>
      </div>

      {/* Where to go next — the three things worth seeing first. */}
      <div className={styles['nextRow']}>
        {NEXT.map((card) => {
          return (
            <Link key={card.to} to={card.to} className={styles['nextCard']}>
              <p className={styles['nextTitle']}>
                <span className={styles['nextMark']} aria-hidden="true" />
                {card.title}
              </p>
              <p className={styles['nextBody']}>{card.body}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
