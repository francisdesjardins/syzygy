// The one place that knows where `.oxfmtrc.json` lives. oxfmt's Node API takes its options
// explicitly and ships no `resolveConfig`, so a call site reading the file itself is a call site
// that can drift from the gate `yarn format:check` runs over the same tree.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { format } from 'oxfmt';

const ROOT = resolve(import.meta.dirname, '..');
const config = JSON.parse(readFileSync(resolve(ROOT, '.oxfmtrc.json'), 'utf8'));

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
