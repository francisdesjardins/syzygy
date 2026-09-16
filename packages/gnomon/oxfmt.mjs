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
 * The config belongs to the package being formatted, and this file is not in it — so the lookup
 * walks up from the working directory the way a formatter's CLI does, rather than from its own
 * location. Reading a config sitting next to this module would silently format every package to
 * one house style, which is the opposite of what a shared tool should impose.
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

const config = JSON.parse(readFileSync(findConfig(), 'utf8'));

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
