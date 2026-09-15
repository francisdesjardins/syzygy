const WORDS: ReadonlyArray<{ term: string; what: string }> = [
  {
    term: 'step',
    what: 'One piece of startup work with an id. It lists what it reads in needs, and that list is the only thing that decides what runs at the same time.',
  },
  {
    term: 'preflight / mounted',
    what: 'Two phases with two different context types. A preflight step runs before anything renders and may refuse the mount. A mounted step runs after a binding has taken over, holds the UI port, and can wait for an answer.',
  },
  {
    term: 'notice',
    what: 'A fact the run recorded. Passive: nothing is expected to act on it. “The config came from a four-hour-old cache.”',
  },
  {
    term: 'intent',
    what: 'UI work the framework-free layer cannot do itself. The app decides what to forward, and an intent nobody forwards is recorded as dropped rather than lost.',
  },
  {
    term: "scope: 'app'",
    what: 'The default. This step is this bootstrap’s work, so every module that declares it does it. Two modules on a page means two requests.',
  },
  {
    term: "scope: 'page'",
    what: 'The same answer for everyone on the page — a token, a configuration. The first module to ask does the work and the others take that answer without asking. Two modules on a page means one request.',
  },
];

/** The five words the rest of the page uses. Defined once, before anything uses them. */
export function Glossary() {
  return (
    <div className="panel glossary">
      <h2>The words on this page</h2>
      <dl>
        {WORDS.map((word) => {
          return (
            <div key={word.term}>
              <dt>
                <code>{word.term}</code>
              </dt>
              <dd>{word.what}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
