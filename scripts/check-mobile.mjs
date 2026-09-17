#!/usr/bin/env node
/**
 * The mobile gate, over the assembled site.
 *
 * Two things have actually gone wrong at phone width and neither was visible to any other check
 * here: the navigation became unreachable, and a panel laid itself out past the right edge. A unit
 * test, a type-check and a contrast measurement all pass through both. So this drives the built
 * site in a real browser at two phone widths and measures pixels.
 *
 * **It runs against `apps/home/dist`, which is what ships** — the playgrounds included, at the
 * paths the site serves them from. A playground measured on its own dev server is a different
 * layout from the one a reader gets, and the shell is the part being measured.
 *
 *     yarn deploy && yarn check:mobile
 *
 * Three assertions per route: nothing crosses the right edge, the drawer opens and its links are
 * reachable, and every dialog the page can open stays inside the viewport. The dialog count is
 * asserted against a floor, because a selector that stops matching would otherwise turn this into
 * a gate that measures nothing and says so in green.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'apps', 'home', 'dist');

if (!existsSync(join(DIST, 'index.html'))) {
  console.error(`check:mobile: no assembled site at ${DIST}.\n  Run \`yarn deploy\` first.`);
  process.exit(1);
}

// Measured at the time of writing; a floor rather than the number, so ordinary content changes do
// not fail it and a broken selector does.
const DIALOG_FLOOR = 60;

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

// The playgrounds are hash-router builds under their own directory, so an unknown path falls back
// to the index.html of *that* directory rather than the site's — which is what Cloudflare does.
const server = createServer((request, response) => {
  const url = decodeURIComponent((request.url ?? '/').split('?')[0].split('#')[0]);
  let file = join(DIST, url);
  if (existsSync(file) && !extname(file)) file = join(file, 'index.html');
  if (!existsSync(file)) {
    const inPlayground = /^\/playground\/[^/]+\//.exec(url);
    file = inPlayground ? join(DIST, inPlayground[0], 'index.html') : join(DIST, 'index.html');
  }
  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
});
await new Promise((ready) => server.listen(0, ready));
const base = `http://localhost:${server.address().port}`;

// 390 is the common iPhone; 360 is the narrowest width worth supporting, and is the one that
// caught the shared site link pushing the theme toggle off the bar.
const VIEWPORTS = [
  ['iPhone 14 — 390x844', { width: 390, height: 844 }],
  ['small Android — 360x640', { width: 360, height: 640 }],
];

const ROUTES = [
  ['/', 'site'],
  ['/design-system', 'site'],
  ['/playground/dialog/#/', 'playground'],
  ['/playground/dialog/#/getting-started', 'playground'],
  ['/playground/dialog/#/dialog-actions', 'playground'],
  ['/playground/dialog/#/slide-dialog', 'playground'],
  ['/playground/dialog/#/stacking', 'playground'],
  ['/playground/dialog/#/showcases', 'playground'],
  ['/playground/dialog/#/ui-templates', 'playground'],
  ['/playground/dialog/#/ui-integrations', 'playground'],
  ['/playground/dialog/#/design-system', 'playground'],
  ['/playground/dialog/#/api', 'playground'],
  ['/playground/boot/#/', 'playground'],
  ['/playground/boot/#/getting-started', 'playground'],
  ['/playground/boot/#/design-system', 'playground'],
  ['/playground/boot/#/api', 'playground'],
];

let failures = 0;
let dialogsMeasured = 0;
const fail = (what, detail) => {
  failures += 1;
  console.error(`    FAIL ${what}${detail ? ` — ${detail}` : ''}`);
};

/**
 * Every visible element whose box crosses the right edge, named well enough to find in the source.
 *
 * Only the right edge: a closed drawer is parked at `translateX(-100%)` and is off-screen *left* on
 * purpose, which is how it hides. And a scroll container may legitimately hold something wider than
 * itself, so anything under one is skipped.
 */
const overflowing = (page) => {
  return page.evaluate(() => {
    const limit = window.innerWidth + 1;
    const found = [];
    for (const element of document.body.querySelectorAll('*')) {
      const box = element.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      let clipped = false;
      for (let at = element.parentElement; at; at = at.parentElement) {
        if (/auto|scroll|hidden/.test(getComputedStyle(at).overflowX)) {
          clipped = true;
          break;
        }
      }
      if (clipped) continue;
      if (box.right > limit) {
        const classes =
          typeof element.className === 'string' && element.className
            ? `.${element.className.trim().split(/\s+/).slice(0, 2).join('.')}`
            : '';
        const id = element.id ? `#${element.id}` : '';
        found.push(
          `${element.tagName.toLowerCase()}${id}${classes} [${Math.round(box.left)}..${Math.round(box.right)}]`
        );
      }
    }
    return {
      found: found.slice(0, 4),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });
};

const browser = await chromium.launch();

for (const [viewportName, viewport] of VIEWPORTS) {
  console.log(`\n  ${viewportName}`);
  const context = await browser.newContext({
    ...devices['iPhone 14'],
    viewport,
    isMobile: true,
    hasTouch: true,
    // A "copy" control is one of the buttons this clicks, and a denied clipboard is a console
    // error about the harness rather than about the page.
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  for (const [route, kind] of ROUTES) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(350);

    const atRest = await overflowing(page);
    if (atRest.scrollWidth > atRest.innerWidth + 1) {
      fail(`${route} scrolls sideways`, `scrollWidth ${atRest.scrollWidth} > ${atRest.innerWidth}`);
    }
    if (atRest.found.length > 0) {
      fail(`${route} puts an element outside the viewport`, atRest.found.join(' | '));
    }

    if (kind === 'playground') {
      const menu = page.locator('button[aria-label="Open navigation"]');
      if ((await menu.count()) === 0 || !(await menu.first().isVisible())) {
        fail(`${route} has no navigation button at phone width`);
      } else {
        await menu.first().click();
        await page.waitForTimeout(400);
        // `aside a`, not `nav a`: both shells put the drawer in an `<aside>` and a page's own
        // section navigation in a `<nav>`. Counting every `nav` let a page with a section list
        // stand in for the drawer, and a mutation that kept the drawer off-screen passed on eight
        // routes out of ten because of it.
        //
        // On screen, not merely laid out: a drawer that never slid in still has links with a width,
        // and "the menu is gone" is exactly the failure that would pass such a check.
        const reachable = await page.locator('aside a').evaluateAll((all) => {
          return all.filter((anchor) => {
            const box = anchor.getBoundingClientRect();
            return (
              box.width > 0 &&
              box.height > 0 &&
              box.right > 0 &&
              box.left < window.innerWidth &&
              box.bottom > 0 &&
              box.top < window.innerHeight
            );
          }).length;
        });
        if (reachable < 5) {
          fail(
            `${route} opened the drawer but its links are not reachable`,
            `${reachable} visible`
          );
        }
        const opened = await overflowing(page);
        if (opened.found.length > 0) {
          fail(
            `${route} pushes content outside the viewport with the drawer open`,
            opened.found.join(' | ')
          );
        }
        await page.keyboard.press('Escape');
        await page.waitForTimeout(250);
      }
    }

    // The dialog manager's own playground is where a dialog's geometry is worth measuring.
    if (route.includes('/dialog/')) {
      const triggers = page.locator('main button:visible');
      const count = Math.min(await triggers.count(), 14);
      for (let index = 0; index < count; index += 1) {
        const trigger = triggers.nth(index);
        const label =
          ((await trigger.textContent()) ?? '').trim().slice(0, 28) || `button ${index}`;
        try {
          await trigger.click({ timeout: 2500 });
        } catch {
          continue;
        }
        await page.waitForTimeout(450);
        const open = page.locator('dialog[open]');
        if ((await open.count()) === 0) continue;
        dialogsMeasured += 1;

        const outside = await open.evaluateAll((all, width) => {
          return all
            .map((element) => {
              const box = element.getBoundingClientRect();
              return {
                left: Math.round(box.left),
                right: Math.round(box.right),
                width: Math.round(box.width),
              };
            })
            .filter((box) => box.right > width + 1 || box.left < -1);
        }, viewport.width);
        if (outside.length > 0) {
          fail(
            `${route}: the dialog behind "${label}" is outside the viewport`,
            JSON.stringify(outside[0])
          );
        }
        const withDialog = await overflowing(page);
        if (withDialog.scrollWidth > withDialog.innerWidth + 1) {
          fail(
            `${route}: "${label}" makes the page scroll sideways`,
            `scrollWidth ${withDialog.scrollWidth}`
          );
        }

        await page.keyboard.press('Escape');
        await page.waitForTimeout(250);
        // A dialog that refuses the dismiss key is one this gate has no business fighting.
        if ((await page.locator('dialog[open]').count()) > 0) {
          await page.goto(base + route, { waitUntil: 'networkidle' });
          await page.waitForTimeout(300);
        }
      }
    }

    const real = errors.filter((text) => !/favicon|manifest|404/i.test(text));
    if (real.length > 0) fail(`${route} logged console errors`, real.slice(0, 2).join(' | '));

    await page.close();
  }
  await context.close();
}

await browser.close();
server.close();

if (dialogsMeasured < DIALOG_FLOOR) {
  fail(
    `only ${dialogsMeasured} dialogs opened, against a floor of ${DIALOG_FLOOR}`,
    'the trigger selector has probably stopped matching'
  );
}

if (failures > 0) {
  console.error(`\ncheck:mobile: ${failures} failure(s).`);
  process.exit(1);
}
console.log(
  `\ncheck:mobile: ${ROUTES.length} routes × 2 phone widths — no overflow, navigation reachable, ${dialogsMeasured} dialogs measured inside the viewport.`
);
