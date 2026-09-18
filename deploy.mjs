#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { access, cp, readFile, rm } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));

/**
 * Assemble francisdesjardins.ca and leave a zip Cloudflare can take.
 *
 * **Sources are named after the package; destinations are named after the capability.** A library
 * gets renamed — these two already traded places once — but a URL is a promise made to whoever
 * bookmarked it. So the dialog manager's playground is served at `/playground/dialog` and the
 * bootstrapper's at `/playground/boot`, whatever the packages end up being called.
 *
 * Four things carry each destination name and they move together or not at all: this table, the
 * rule in `apps/home/public/_redirects`, the dev-server rewrite in `apps/home/vite.config.ts`, and
 * the link on the home page itself. Missing one does not give a 404 — the SPA fallback hands back
 * its own document, which routes nowhere, and the sub-site quietly serves the wrong page.
 */
const PLAYGROUNDS = [
  { workspace: 'antumbra', capability: 'dialog', label: 'the dialog manager' },
  { workspace: 'umbra', capability: 'boot', label: 'the bootstrapper' },
  { workspace: 'penumbra', capability: 'design', label: 'the design system' },
];

const HOME = resolve(ROOT, 'apps', 'home');
const HOME_DIST = resolve(HOME, 'dist');
const SITE_PLAYGROUND = resolve(HOME, 'public', 'playground');
const ZIP_NAME = 'francisdesjardins.ca-dist.zip';
const DEPLOY_ZIP = resolve(ROOT, ZIP_NAME);

const c = {
  reset: '\u001b[0m',
  bold: '\u001b[1m',
  dim: '\u001b[2m',
  green: '\u001b[32m',
  cyan: '\u001b[36m',
  yellow: '\u001b[33m',
  red: '\u001b[31m',
  magenta: '\u001b[35m',
  bgCyan: '\u001b[46m\u001b[30m',
};

const icon = {
  build: '\u{1f528}',
  clean: '\u{1f5d1}\ufe0f ',
  copy: '\u{1f4e6}',
  done: '\u2705',
  err: '\u274c',
  run: '\u26a1',
  install: '\u{1f4e5}',
  zip: '\u{1f5dc}\ufe0f ',
  folder: '\u{1f4c2}',
};

/** Characters that survive both cmd.exe and sh untouched. Anything else gets quoted. */
const SHELL_SAFE = /^[A-Za-z0-9._:\\/=@+-]+$/;

/**
 * Quote one argument of the command line built for `shell: true`.
 *
 * Whitespace is not the only thing that needs it. A folder named `Ana (Work)` or one with an `&`
 * in it is ordinary on Windows, and both break an unquoted command line — the first with a syntax
 * error, the second by running half the line as a second command.
 */
function quote(part) {
  if (SHELL_SAFE.test(part)) {
    return part;
  }

  // cmd.exe has no escape character inside double quotes; doubling is how a literal quote is
  // written. POSIX shells take a backslash.
  const escaped =
    process.platform === 'win32'
      ? part.replaceAll('"', '""')
      : part.replaceAll(/(["\\$`])/g, '\\$1');

  return `"${escaped}"`;
}

function run(cmd, { args, cwd }) {
  const full = [cmd, ...args].map(quote).join(' ');

  return new Promise((ok, fail) => {
    console.log(`\n  ${c.dim}${icon.run} ${c.cyan}$ ${full}${c.reset}`);
    console.log(`  ${c.dim}   cwd: ${cwd}${c.reset}\n`);

    const child = spawn(full, { cwd, stdio: 'inherit', shell: true });

    child.on('close', (code) => {
      if (code === 0) {
        ok();
      } else {
        fail(new Error(`Process exited with code ${code}`));
      }
    });
    child.on('error', fail);
  });
}

/**
 * Invoke the Yarn release vendored in this repository, through the current Node binary.
 *
 * One workspace root means one resolution, where the old script needed three. The version comes
 * from `packageManager`, with `yarnPath` as a second source — both are rewritten by
 * `yarn set version`, so an upgrade needs no change here.
 */
async function resolveYarn() {
  const candidates = [];

  try {
    const pkg = JSON.parse(await readFile(resolve(ROOT, 'package.json'), 'utf8'));
    const version = /^yarn@([^+\s]+)/.exec(pkg.packageManager ?? '')?.[1];

    if (version) {
      candidates.push(resolve(ROOT, '.yarn', 'releases', `yarn-${version}.cjs`));
    }
  } catch {
    // Unreadable or malformed package.json — try the next source.
  }

  try {
    const yarnrc = await readFile(resolve(ROOT, '.yarnrc.yml'), 'utf8');
    const yarnPath = /^yarnPath:\s*['"]?(.+?)['"]?\s*$/m.exec(yarnrc)?.[1];

    if (yarnPath) {
      candidates.push(resolve(ROOT, yarnPath));
    }
  } catch {
    // No .yarnrc.yml — try the next source.
  }

  for (const release of candidates) {
    try {
      await access(release);
      return (args) => run(process.execPath, { args: [release, ...args], cwd: ROOT });
    } catch {
      // Declared but not on disk — try the next candidate.
    }
  }

  console.log(
    `  ${c.dim}No vendored Yarn release found, falling back to \`yarn\` on PATH.${c.reset}`
  );
  return (args) => run('yarn', { args, cwd: ROOT });
}

/**
 * A build that "succeeded" without leaving a dist is a silently wrong deploy: the copy either
 * throws an ENOENT naming a path nobody asked about, or — worse, when a stale dist is still lying
 * there — publishes the previous build. Check the output, and name the step that owed it.
 */
async function ensureDist(dist, producedBy) {
  try {
    await access(resolve(dist, 'index.html'));
  } catch {
    throw new Error(`No build output at ${dist}\n    Expected ${producedBy} to have produced it.`);
  }
}

/**
 * Pulse the Explorer window already showing `dir`, if there is one.
 *
 * Explorer has no "reuse the existing window" switch for `/select`, so without this check every
 * deploy stacks another window on the same folder. Shell windows that aren't filesystem folders
 * throw on `Path` and are skipped. A match is flashed rather than raised: `FlashWindowEx` pulses
 * the taskbar button without stealing focus from the terminal, and is a no-op on a window that is
 * already in front of you.
 */
function pulseExplorerAt(dir) {
  const target = dir.replaceAll("'", "''");

  const ps = `
$ErrorActionPreference = 'SilentlyContinue'
$t = '${target}'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class DeployFlash {
  [StructLayout(LayoutKind.Sequential)]
  public struct FLASHWINFO {
    public uint cbSize; public IntPtr hwnd; public uint dwFlags;
    public uint uCount; public uint dwTimeout;
  }
  [DllImport("user32.dll")]
  [return: MarshalAs(UnmanagedType.Bool)]
  private static extern bool FlashWindowEx(ref FLASHWINFO pwfi);
  public static void Pulse(IntPtr hwnd) {
    FLASHWINFO fi = new FLASHWINFO();
    fi.cbSize = (uint)Marshal.SizeOf(typeof(FLASHWINFO));
    fi.hwnd = hwnd;
    fi.dwFlags = 3;
    fi.uCount = 3;
    fi.dwTimeout = 0;
    FlashWindowEx(ref fi);
  }
}
'@
$shell = New-Object -ComObject Shell.Application
$open = @($shell.Windows() | Where-Object {
  try { $_.Document.Folder.Self.Path -eq $t } catch { $false }
})
if ($open.Count -eq 0) { exit 1 }
foreach ($w in $open) {
  try { [DeployFlash]::Pulse((New-Object System.IntPtr([int64]$w.HWND))) } catch { }
}
exit 0
`;

  // -EncodedCommand (UTF-16LE base64) keeps the multi-line script and its embedded quotes intact
  // across the cmd/PowerShell argument boundary.
  const encoded = Buffer.from(ps, 'utf16le').toString('base64');

  return new Promise((ok) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded],
      {
        stdio: 'ignore',
        windowsHide: true,
      }
    );

    child.on('close', (code) => {
      ok(code === 0);
    });
    child.on('error', () => {
      ok(false);
    });
  });
}

/**
 * Open the file manager on the folder holding the deploy zip, with the zip selected where the
 * platform supports it. Never rejects — the build is already done by the time this runs.
 */
async function revealZip() {
  const dir = dirname(DEPLOY_ZIP);

  try {
    if (process.platform === 'win32') {
      if (await pulseExplorerAt(dir)) {
        console.log(
          `  ${c.dim}${icon.folder} Explorer already open at ${dir} — window pulsed${c.reset}\n`
        );
        return;
      }

      // `/select,<path>` must stay a single argument, hence the manual quoting.
      spawn(`explorer.exe /select,"${DEPLOY_ZIP}"`, {
        shell: true,
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      }).unref();
    } else if (process.platform === 'darwin') {
      spawn('open', ['-R', DEPLOY_ZIP], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('xdg-open', [dir], { detached: true, stdio: 'ignore' }).unref();
    }

    console.log(`  ${c.dim}${icon.folder} Opened ${dir}${c.reset}\n`);
  } catch (err) {
    console.log(`  ${c.dim}${icon.folder} Could not open ${dir}: ${err.message}${c.reset}\n`);
  }
}

const TOTAL_STEPS = 3 + PLAYGROUNDS.length * 3;
let stepNumber = 0;

const timings = [];

async function timed(label, fn) {
  const start = performance.now();
  await fn();
  timings.push({ label, ms: performance.now() - start });
}

async function step(message, { label, work }) {
  stepNumber += 1;
  const n = stepNumber;
  console.log(`  ${c.magenta}[${n}/${TOTAL_STEPS}]${c.reset} ${message}`);
  await timed(label, work);
  console.log(
    `  ${c.green}[${n}/${TOTAL_STEPS}] \u2713${c.reset} ${c.dim}${label} done.${c.reset}`
  );
}

function formatDuration(ms) {
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${Math.floor(ms / 60_000)}m ${((ms % 60_000) / 1000).toFixed(0)}s`;
}

async function main() {
  const totalStart = performance.now();
  console.log(`\n  ${c.bgCyan}${c.bold} \u{1f680} Deploy francisdesjardins.ca ${c.reset}\n`);

  const yarn = await resolveYarn();

  // One install for every workspace, which is the whole reason these projects share a repository.
  await step(`${icon.install} Installing ${c.yellow}every workspace${c.reset}...`, {
    label: 'Install',
    work: () => yarn(['install', '--immutable']),
  });

  for (const { workspace, capability, label } of PLAYGROUNDS) {
    const dist = resolve(ROOT, 'packages', workspace, 'playground', 'dist');
    const destination = resolve(SITE_PLAYGROUND, capability);

    // `build:file`, never `build`. The `:file` variant is what makes the bundle relocatable:
    // relative asset URLs and the route in the hash. A plain build writes absolute `/assets/…`
    // paths, every one of which 404s under `/playground/<capability>/` — and the SPA fallback
    // answers each 404 with the home page's HTML, so the failure arrives as a blank sub-site
    // rather than as an error anyone can read.
    await step(
      `${icon.build} Building ${c.yellow}${workspace}${c.reset}'s playground (${label})...`,
      {
        label: `Build ${workspace} playground`,
        work: () => yarn(['workspace', workspace, 'run', 'playground:build:file']),
      }
    );

    await step(`${icon.clean}Removing existing public/playground/${capability}...`, {
      label: `Remove old ${capability}`,
      work: () => rm(destination, { recursive: true, force: true }),
    });

    await step(
      `${icon.copy} Copying dist \u2192 ${c.yellow}public/playground/${capability}${c.reset}`,
      {
        label: `Copy ${workspace} dist`,
        work: async () => {
          await ensureDist(dist, `${workspace}'s playground:build:file`);
          await cp(dist, destination, { recursive: true });
        },
      }
    );
  }

  // Whatever now sits in apps/home/public/playground/ is carried into dist/ by Vite.
  await step(`${icon.build} Building ${c.yellow}the home${c.reset}...`, {
    label: 'Build home',
    work: () => yarn(['workspace', 'home', 'run', 'build']),
  });

  await step(
    `${icon.zip}Zipping dist \u2192 ${c.yellow}francisdesjardins.ca-dist.zip${c.reset}...`,
    {
      label: 'Zip dist',
      work: async () => {
        await ensureDist(HOME_DIST, 'the home build');
        await rm(DEPLOY_ZIP, { force: true });

        if (process.platform === 'win32') {
          // Relative to the repository root, not absolute: tar reads `host:path` as a remote
          // archive, and a Windows drive letter is exactly that shape — `D:\…` fails with
          // "Cannot connect to D".
          await run('tar', {
            args: ['-a', '-cf', ZIP_NAME, '-C', relative(ROOT, HOME_DIST), '.'],
            cwd: ROOT,
          });
        } else {
          await run('zip', { args: ['-r', DEPLOY_ZIP, '.'], cwd: HOME_DIST });
        }
      },
    }
  );

  const totalMs = performance.now() - totalStart;
  const maxLabel = Math.max(...timings.map((t) => t.label.length));

  console.log(`\n  ${c.bgCyan}${c.bold} \u23f1  Timing Summary ${c.reset}\n`);
  for (const t of timings) {
    const bar = '\u2588'.repeat(Math.max(1, Math.round((t.ms / totalMs) * 30)));
    console.log(
      `  ${c.dim}${t.label.padEnd(maxLabel)}${c.reset}  ${c.cyan}${bar}${c.reset}  ${c.bold}${formatDuration(t.ms)}${c.reset}`
    );
  }
  console.log(
    `\n  ${'Total'.padEnd(maxLabel)}     ${c.green}${c.bold}${formatDuration(totalMs)}${c.reset}`
  );
  console.log(
    `\n  ${icon.done} ${c.green}${c.bold}Done! Upload ${c.yellow}francisdesjardins.ca-dist.zip${c.green} to Cloudflare.${c.reset}\n`
  );

  await revealZip();
}

main().catch((err) => {
  console.error(
    `\n  ${icon.err} ${c.red}${c.bold}ERROR:${c.reset} ${c.red}${err.message}${c.reset}\n`
  );
  process.exit(1);
});
