// Loads the built playground in a real browser and checks that the demo actually boots.
//
// The unit suite proves the core's behaviour; this proves the demo is wired to it. Those fail
// separately: a playground can compile, build and render an empty page for a whole afternoon.
//
// Run by `yarn smoke`, after `yarn playground:build`.

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = 4173;
const PAGE_URL = `http://localhost:${PORT}/`;

// Resolved from this file rather than from the cwd: Yarn hoists `node_modules` to the repo root,
// so a path relative to `playground/` finds nothing.
const viteBin = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const preview = spawn('node', [viteBin, 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: fileURLToPath(new URL('../playground', import.meta.url)),
  stdio: 'ignore',
  shell: false,
});

let browser;
const failures = [];

try {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const probe = await fetch(PAGE_URL);
      if (probe.ok) break;
    } catch {
      // not up yet
    }
    await delay(250);
  }

  browser = await chromium.launch();
  const page = await browser.newPage();
  /**
   * What the page throws on purpose.
   *
   * The Test Harnesses route renders fixtures that prove a *refusal*, and a refusal is a throw:
   * React and Solid each log one on the way to the boundary that renders the message the assertion
   * reads. Muting console errors wholesale would hide a real one, so the deliberate text is named
   * here and everything else still fails the run.
   */
  const DELIBERATE = ['useBootstrapContext was called outside a <BootstrapProvider>.'];

  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  // The home page first: it is the route the router serves at `/`, and a build where the router
  // failed to mount shows an empty body here rather than an error anywhere.
  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { level: 1 }).first().waitFor({ timeout: 15_000 });

  // The run demo moved off `/` when the playground gained a router; the reader lands on Home and
  // walks into this one.
  await page.goto(`${PAGE_URL}getting-started`, { waitUntil: 'domcontentloaded' });

  // The graph is drawn before anything runs, so it is the first proof the library loaded.
  await page.locator('.plan-graph .node').first().waitFor({ timeout: 15_000 });

  // The chart is drawn from the event stream. No bars means the demo is showing a snapshot, or
  // nothing at all.
  await page.locator('.run-chart .bar').first().waitFor({ timeout: 15_000 });
  await page.locator('.verdict .status').first().waitFor({ timeout: 15_000 });

  // The trial warning is off by default — the page has to be readable before it asks anything — so
  // the run that raises it is asked for here the way a reader would ask for it.
  await page.getByRole('checkbox', { name: 'Trial nearly expired' }).check();
  await page.getByTestId('boot-again').click();

  // Two bootstraps share this realm, and the steps that produce the warning are shared, so it
  // has to ask once. Asking twice is the bug this scope exists to fix, and it came back once.
  await page.locator('dialog[open]').waitFor({ timeout: 15_000 });
  await page.getByTestId('dialog-acknowledge').click();
  await delay(1200);
  if (await page.locator('dialog[open]').isVisible()) {
    failures.push('A second dialog opened: the trial warning was raised more than once.');
  }

  // The Solid panel booted second, so it should have adopted the shared steps rather than redoing
  // them. A readout of zero means the shared scope is not connecting the two bootstraps at all.
  const adopted = await page.getByTestId('solid-shared').innerText();
  if (adopted.includes(': 0')) {
    failures.push(`The Solid panel adopted nothing from the others: "${adopted}"`);
  }

  // Lowercased because the panel renders the status uppercase; the value is the library's.
  const status = (await page.locator('.verdict .status').first().innerText()).trim().toLowerCase();
  if (status !== 'degraded' && status !== 'ready') {
    failures.push(`Unexpected status on a clean boot: ${status}`);
  }

  // The pages with no demo in them. They carry no behaviour worth asserting, so what is checked is
  // that the route resolves and renders something — which is the way a lazy route fails.
  for (const route of ['design-system', 'stories']) {
    await page.goto(`${PAGE_URL}${route}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { level: 1 }).first().waitFor({ timeout: 15_000 });
  }

  const unexpected = consoleErrors.filter((text) => {
    return !DELIBERATE.some((allowed) => {
      return text.includes(allowed);
    });
  });
  if (unexpected.length > 0) {
    failures.push(`Console errors: ${unexpected.join(' | ')}`);
  }

  // The frame, which the page above never touches. It shipped once with a React fragment that threw
  // on its first render and left its panel blank, and nothing noticed — because nothing looked.
  //
  // Waited on by content rather than by element: every panel exists in the markup from the first
  // byte and is empty until its fragment settles, so reading on arrival measures nothing. The first
  // version of this check did exactly that and reported four empty panels on a working page.
  await page.goto(`${PAGE_URL}microfrontends`, { waitUntil: 'domcontentloaded' });
  const frame = page.frameLocator('[data-testid="demo-frame"]');

  // `getByText` pierces the open shadow root the trial panel lives in, which `innerText` on its host
  // element does not.
  for (const marker of ['Signed in as', 'Atlas migration', 'Acme Workspace']) {
    await frame.getByText(marker, { exact: false }).first().waitFor({ timeout: 25_000 });
  }

  for (const [id, expected] of [
    ['topbar', /Signed in as/],
    ['nav', /Projects/],
    ['list', /Atlas migration/],
  ]) {
    const text = await frame.locator(`#${id}`).innerText();
    if (!expected.test(text)) {
      failures.push(`The ${id} fragment rendered "${text.replace(/\s+/g, ' ').trim()}"`);
    }
    if (!/ran it|adopted/.test(text)) {
      failures.push(`The ${id} fragment shows no step chips.`);
    }
  }

  // The fragment on its own build of the library. If this ever reads `ran it` for the session, the
  // two copies stopped finding each other and the demo is claiming something untrue.
  const sharers = await frame.getByText('session · adopted').count();
  if (sharers < 2) {
    failures.push(
      `Only ${sharers} fragment(s) adopted the session; shared scope is not connecting.`
    );
  }

  // The reference. It is generated at build time from typedoc, so it fails in exactly one way —
  // silently, with a page full of nothing. It is also eleven pages now rather than one, and a
  // chapter that renders empty is invisible from any other chapter.
  await page.goto(`${PAGE_URL}api`, { waitUntil: 'domcontentloaded' });
  const railLinks = page.locator('nav[aria-label="API reference"] a[href*="/api/"]');
  await railLinks.first().waitFor({ timeout: 25_000 });

  const chapters = await railLinks.evaluateAll((links) => {
    return links.map((link) => {
      return link.getAttribute('href') ?? '';
    });
  });
  const seen = [...new Set(chapters)];
  if (seen.length < 10) {
    failures.push(`The reference rail lists ${seen.length} chapters; the package has more.`);
  }

  let documented = 0;
  for (const href of seen) {
    await page.goto(new URL(href, PAGE_URL).href, { waitUntil: 'domcontentloaded' });
    const articles = page.locator('[id^="api-"]');
    await articles.first().waitFor({ timeout: 25_000 });
    const count = await articles.count();
    documented += count;
    // A symbol with no declaration line is the shape typedoc failures take: the name renders, the
    // signature does not.
    const withSignature = await articles.locator('code').count();
    if (withSignature < count) {
      failures.push(`${href} rendered ${count} symbols but only ${withSignature} signatures.`);
    }
  }
  if (documented < 60) {
    failures.push(
      `The reference rendered ${documented} symbols; the package exports more than that.`
    );
  }

  // Back to the frame, and waited on the same way: the counter is read last because it is the last
  // thing to settle, and reading it on arrival is how this check first reported three.
  await page.goto(`${PAGE_URL}microfrontends`, { waitUntil: 'domcontentloaded' });
  const reloaded = page.frameLocator('[data-testid="demo-frame"]');
  for (const marker of ['Signed in as', 'Atlas migration', 'Acme Workspace']) {
    await reloaded.getByText(marker, { exact: false }).first().waitFor({ timeout: 25_000 });
  }
  const calls = await reloaded.locator('#calls').innerText();
  if (calls !== '4') {
    failures.push(
      `The fragments made ${calls} requests under shared scope; four is the right answer.`
    );
  }

  // The scope control is a pair of links, so the setting lives in the address. It pointed at a route
  // that no longer existed for a while and nothing caught it: the page loads either way, and only a
  // click tells you the link goes nowhere.
  await page.getByRole('link', { name: 'Every fragment does its own' }).click();
  await page.waitForURL(/scope=instance/, { timeout: 15_000 });
  const unshared = page.frameLocator('[data-testid="demo-frame"]');
  for (const marker of ['Signed in as', 'Atlas migration', 'Acme Workspace']) {
    await unshared.getByText(marker, { exact: false }).first().waitFor({ timeout: 25_000 });
  }
  const own = await unshared.locator('#calls').innerText();
  if (own !== '8') {
    failures.push(`With sharing off the page made ${own} requests; eight is every fragment's own.`);
  }

  // The single-spa frame: a root config that runs the bootstrap before `start()`, and two
  // applications that get what they need in the two different ways.
  await page.goto(`${PAGE_URL}single-spa`, { waitUntil: 'domcontentloaded' });
  const spa = page.frameLocator('[data-testid="demo-frame"]');
  await spa.getByText('Signed in as', { exact: false }).first().waitFor({ timeout: 25_000 });

  const beforeReports = await spa.locator('#calls').innerText();
  if (beforeReports !== '3') {
    failures.push(`The root config sent ${beforeReports} requests; three is the shared answer.`);
  }

  await spa.locator('#nav-reports').click();
  await spa.getByText('loaded late', { exact: false }).first().waitFor({ timeout: 25_000 });
  const adoptedByReports = await spa.getByText('session · adopted').count();
  if (adoptedByReports === 0) {
    failures.push('The late application did not adopt the session it was never handed.');
  }
  const afterReports = await spa.locator('#calls').innerText();
  // One more, and only one: its own filters. The shared work is not done twice because an
  // application arrived after the root had finished.
  if (afterReports !== '4') {
    failures.push(`Opening reports took the count to ${afterReports}; four is one new request.`);
  }

  if (failures.length === 0) {
    console.log(
      `smoke: the playground settled as "${status}", and the frame's four fragments made ${calls} requests between them.`
    );
  }
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  await browser?.close();
  preview.kill();
}

if (failures.length > 0) {
  console.error('smoke failed:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
