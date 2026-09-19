/*
 * A consumer's program compiles corona's source without including corona's stray `.d.ts`, so these
 * declarations travel only if the module that needs them asks for them. Two playgrounds each kept
 * their own copy of the file before this line existed.
 *
 * The rule asks for an `import`, which is the one thing that cannot work: the file is ambient
 * `declare module`, and a `declare module` is only ambient in a script.
 */
// oxlint-disable-next-line typescript/triple-slash-reference -- see above
/// <reference path="./react-syntax-highlighter-subpaths.d.ts" />

import { useTheme } from '../theme/index.ts';
import { readableSyntaxStyle } from 'limb/readable-syntax';
// Deep paths, not the barrels: `react-syntax-highlighter` re-exports the whole Prism build (every
// grammar refractor ships) and `styles/prism` re-exports all 47 themes, and Vite serves modules
// unbundled in dev — so a barrel import pays for all of it whatever the named import says.
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';

// The whole list of grammars the playgrounds ask for. An unregistered one renders as plain text
// and raises nothing, so a fifth `language` value is a silent downgrade — register it in the same
// commit. Free: refractor's `tsx` pulls `jsx`, `typescript`, `markup`, `javascript`, `clike`.
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('markup', markup);
// Shell, for the "getting it" block on the landing page — the one sample that is not source.
SyntaxHighlighter.registerLanguage('bash', bash);
// Stylesheets, for the design pages that print their own rules.
SyntaxHighlighter.registerLanguage('css', css);

export type CodeLanguage = 'tsx' | 'markup' | 'bash' | 'css';

/*
 * `--app-paper`, spelled out: the block paints it *and* `readableSyntaxStyle` measures every token
 * colour against it, and a `var()` cannot be measured. Keep it equal to the token.
 *
 * It was spelled out twice, and the second copy had drifted to `#1a1a1a` — correcting every token
 * for a background the code was not on. One copy is the fix; the comment was already there.
 */
const SURFACE = { light: '#ffffff', dark: '#111a2b' } as const;

/**
 * Source, coloured, and readable on the surface it is actually painted on.
 *
 * `oneLight` and `oneDark` are tuned for their own backgrounds, so on this site's the quietest
 * tokens fall under 4.5:1 — `readableSyntaxStyle` raises them without moving the hue, which is what
 * keeps each theme recognisable.
 */
export function HighlightedCode({
  source,
  language = 'tsx',
  wrap = false,
  lineNumbers = false,
}: {
  readonly source: string;
  readonly language?: CodeLanguage | undefined;
  readonly wrap?: boolean | undefined;
  /** Numbers down the gutter. Worth it for a whole file, noise beside a six-line example. */
  readonly lineNumbers?: boolean | undefined;
}) {
  const { scheme } = useTheme();
  const dark = scheme === 'dark';
  const surface = SURFACE[dark ? 'dark' : 'light'];

  return (
    <SyntaxHighlighter
      language={language}
      style={readableSyntaxStyle(dark ? oneDark : oneLight, surface)}
      customStyle={{
        fontSize: 'var(--app-text-sm)',
        lineHeight: 1.7,
        background: surface,
        margin: 0,
        padding: 'var(--app-space-4)',
        // The token, not a stack of its own: code is the largest mono surface here, and a second
        // opinion about the mono face shows up as two monos on one page.
        fontFamily: 'var(--app-font-mono)',
        // The theme puts `overflow: auto` on the `pre`, which makes two nested scrollers out of
        // one block: the wrapper in `CodeBlock` is the one that scrolls and the one that carries
        // the keyboard stop and the label, so this one must not compete for either.
        overflow: 'visible',
      }}
      // The theme paints its own near-grey on the `<code>`, which shows through wherever no token
      // covers it — every run of indentation, as a ladder of grey blocks down the left.
      codeTagProps={{ style: { background: 'transparent' } }}
      // Both off when wrapping: they wrap each line into a flex row of tokens, which scrambles them.
      wrapLines={!wrap}
      wrapLongLines={wrap}
      showLineNumbers={lineNumbers && !wrap}
      lineNumberStyle={{
        minWidth: '3.5em',
        paddingRight: '1.5em',
        // A line number is text a reader uses, so it is held to the same contrast as any other:
        // `#cbd5e0` on white measured 1.49:1.
        color: dark ? '#8b94a7' : '#6b7280',
        userSelect: 'none',
        textAlign: 'right',
        fontSize: 'var(--app-text-xs)',
      }}
    >
      {source}
    </SyntaxHighlighter>
  );
}
