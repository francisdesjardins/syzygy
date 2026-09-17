#!/usr/bin/env node
/**
 * What a robot reads and what a person reads are the same four sentences.
 *
 * `#root` is empty until the bundle runs. Googlebot runs it; Slack, LinkedIn, X and iMessage do
 * not — they read `index.html`'s head and stop. So the head is the whole page for them, and it has
 * to say what the page says.
 *
 * Nothing structural keeps two files agreeing, which is why these two stopped: the head called this
 * a web developer's site long after the application had stopped saying so. English is the
 * comparison because the head has one language and `defaultLng` is `en`; the French strings are
 * checked for presence, not against markup that cannot hold them.
 *
 * The two colours are here because it is the same failure one layer down — a palette outside the
 * token sheets, which is how both came to be MUI's default blue.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const head = readFileSync('index.html', 'utf8');
const manifest = JSON.parse(readFileSync('public/manifest.json', 'utf8'));
const en = JSON.parse(readFileSync('src/i18n/translations/en/common.json', 'utf8'));
const fr = JSON.parse(readFileSync('src/i18n/translations/fr/common.json', 'utf8'));
const sheets = [
  readFileSync(createRequire(import.meta.url).resolve('penumbra/tokens.skin.base.css'), 'utf8'),
  readFileSync('src/styles/tokens.skin.css', 'utf8'),
];

const failures = [];

const decode = (value) => {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
};

/** Whitespace in the markup is the formatter's; the sentence is what has to match. */
const squash = (value) => {
  return decode(value).replaceAll(/\s+/g, ' ').trim();
};

const tag = (pattern, what) => {
  const found = pattern.exec(head);
  if (found === null) {
    failures.push(`index.html has no ${what}.`);
    return null;
  }
  return squash(found[1]);
};

const agree = (found, { expected, what }) => {
  if (found !== null && found !== expected) {
    failures.push(`${what} disagree.\n    head: ${found}\n    app:  ${expected}`);
  }
};

const PAIRS = [
  [/<title>([\s\S]*?)<\/title>/, '<title>', 'title'],
  [/<meta\s+name="description"\s+content="([\s\S]*?)"/, 'meta description', 'description'],
  [/<meta\s+property="og:title"\s+content="([\s\S]*?)"/, 'og:title', 'ogTitle'],
  [/<meta\s+property="og:description"\s+content="([\s\S]*?)"/, 'og:description', 'ogDescription'],
  [/<meta\s+name="twitter:title"\s+content="([\s\S]*?)"/, 'twitter:title', 'ogTitle'],
  [
    /<meta\s+name="twitter:description"\s+content="([\s\S]*?)"/,
    'twitter:description',
    'ogDescription',
  ],
];

for (const [pattern, what, key] of PAIRS) {
  agree(tag(pattern, what), { expected: en.seo.home[key], what: `${what} and seo.home.${key}` });
}

/** A key present in one language and blank in the other is a page that is half translated. */
for (const key of ['title', 'description', 'ogTitle', 'ogDescription']) {
  const value = fr.seo.home[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    failures.push(`fr seo.home.${key} is missing or empty.`);
  }
}

/** The light scheme, which is what a browser chrome and a splash screen are painted in. */
const tokenValue = (name) => {
  for (const sheet of sheets) {
    const light = sheet.slice(0, sheet.indexOf('data-color-scheme'));
    const found = new RegExp(`${name}:\\s*([^;]+);`).exec(light);
    if (found !== null) {
      return found[1].trim();
    }
  }
  return '(not declared)';
};

const colour = (found, { token, what }) => {
  const expected = tokenValue(token);
  if (found?.toLowerCase() !== expected.toLowerCase()) {
    failures.push(`${what} is ${String(found)}, and ${token} is ${expected}.`);
  }
};

colour(tag(/<meta\s+name="theme-color"\s+content="([\s\S]*?)"/, 'theme-color'), {
  token: '--app-primary',
  what: "index.html's theme-color",
});
colour(manifest.theme_color, { token: '--app-primary', what: "manifest.json's theme_color" });
colour(manifest.background_color, { token: '--app-bg', what: "manifest.json's background_color" });

if (failures.length > 0) {
  console.error('\nhome: the head and the application do not say the same thing.\n');
  for (const failure of failures) {
    console.error(`  ${failure}\n`);
  }
  process.exit(1);
}

console.log('check:head: the head, the application and the token sheet agree.');
