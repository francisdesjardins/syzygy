// The one place that knows where `.oxfmtrc.json` lives. oxfmt's Node API takes its options
// explicitly and ships no `resolveConfig`, so a call site reading the file itself is a call site
// that can drift from the gate `yarn format:check` runs over the same tree.
//
// **Parse failures are raised rather than returned.** `format` hands back the original text with
// the diagnostics beside it, so a caller comparing its answer to what it passed in reads an
// unparsable `@example` as one that needed no formatting — which is the whole of what
// `check-examples.mjs` is looking for.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { format } from 'oxfmt';

/**
 * The lookup walks up from the working directory the way the CLI does, rather than from this
 * module's own location: the answer has to be the one `yarn format` would give in that directory,
 * whether it comes from the repository root or from a package that put a config beside its
 * manifest. Reading a config sitting next to this module would impose a style the gate does not.
 */
const findConfig = () => {
  let at = process.cwd();
  for (;;) {
    const candidate = resolve(at, '.oxfmtrc.json');
    if (existsSync(candidate)) {
      return candidate;
    }
    const up = dirname(at);
    if (up === at) {
      throw new Error(`No .oxfmtrc.json at or above ${process.cwd()}.`);
    }
    at = up;
  }
};

/**
 * oxfmt's own CLI reads the config as JSONC, so this has to as well — every other config in this
 * repository carries the reasoning for its settings in comments, and a reader that accepts only
 * strict JSON makes writing one down a breaking change to a package that never sees it.
 *
 * String-aware, because the `$schema` value contains a `//` of its own.
 */
const stripComments = (text) => {
  let out = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i += 1) {
    const character = text[i];
    if (inString) {
      out += character;
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }
    if (character === '"') {
      inString = true;
      out += character;
      continue;
    }
    if (character === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') {
        i += 1;
      }
      out += '\n';
      continue;
    }
    if (character === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        i += 1;
      }
      i += 1;
      continue;
    }
    out += character;
  }
  // A trailing comma is legal in JSONC and is what a commented-out last entry leaves behind.
  return out.replace(/,(\s*[}\]])/g, '$1');
};

const config = JSON.parse(stripComments(readFileSync(findConfig(), 'utf8')));

/**
 * Format `text` the way `yarn format` would format a file named `fileName` — the name carries the
 * language, so it need not exist on disk.
 *
 * @param {string} fileName
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function formatAs(fileName, text) {
  const { code, errors } = await format(fileName, text, config);
  if (errors.length > 0) {
    throw new Error(`oxfmt could not parse ${fileName}: ${errors[0].message}`);
  }
  return code;
}
