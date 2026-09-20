/**
 * Zero-dependency debug logger for browser devtools — near-zero overhead when disabled. Every line
 * carries a monotonic `#0001` id shared across namespaces: note the latest, do the thing you are
 * investigating, then read everything above it.
 *
 * Enable with {@link setLogLevel} — `'*'`, `'step'`, `'step,intent'`, `'boot:step'`. Namespaces:
 * `run` (the run itself), `step` (each attempt and how it ended), `plan` (the graph the scheduler
 * derived), `intent` (what the run handed the host), `live` (the live view's forwarding).
 *
 * **There is no `localStorage` switch, and that is the one place this parts company with antumbra's
 * logger.** `no-dom.test.ts` measures that a full run reads no DOM global at all, which is what lets
 * the core run in a worker, a service or a server render; a pattern read per line would spend that
 * to save a function call. The host owns the boot sequence by construction, so it can call
 * `setLogLevel` before `run()` — which is the same moment a persisted flag would have been read.
 *
 * **Privacy**: opt-in, debug-only, console-only — nothing persisted or transmitted. Never logged:
 * step data, notice payloads, intent payloads. **Logged**: step ids, statuses, durations, and
 * `error.message` from a failing step — which can carry application data where a session-replay tool
 * captures `console`.
 */

/**
 * Namespace colours, painted as a **filled badge** rather than coloured text: the console follows
 * the *system* theme, so ink would have to clear 4.5:1 on white **and** `#1f1f1f`, and no single
 * value reaches both. A badge's label contrasts against a colour this file owns.
 *
 * The five are antumbra's measured hexes against the same ink, taken rather than re-picked, so the
 * two libraries read as one family in a console showing both.
 */
const colors: Readonly<Record<string, string>> = {
  run: '#4CAF50',
  step: '#2196F3',
  plan: '#03A9F4',
  intent: '#FF9800',
  live: '#BA68C8',
};

/** One ink for every badge — near-black, and ≥5:1 on all five. */
const labelInk = '#10131a';

const labelStyle = (color: string) => {
  return `background:${color};color:${labelInk};font-weight:bold;padding:1px 4px;border-radius:2px`;
};
const resetStyle = 'color:inherit';
/**
 * The sequence id is bare text on the console's own background and cannot be a badge without two
 * per line; `#7e7e7e` is where both themes are equally bad (4.06:1), beating `#888`'s 3.54:1 light.
 */
const idStyle = 'color:#7e7e7e;font-weight:normal';

// ── Sequence id ─────────────────────────────────────────────────────────────

// Shared across every logger instance, so ids order globally across namespaces; only advances on
// an emitted log, which is what keeps the sequence dense enough to anchor to.
let logSeq = 0;

function nextLogId(): string {
  logSeq += 1;
  return `#${logSeq.toString().padStart(4, '0')}`;
}

// ── Pattern matching ────────────────────────────────────────────────────────

const scopePrefix = 'boot:';

/** The pattern {@link setLogLevel} was last given; `null` is off, which is where it starts. */
let pattern: string | null = null;

/**
 * The spellings one pattern token may mean — both, when it starts with the scope.
 *
 * A reader who has seen `boot:step` on a badge will type it back, so `'boot:step'` has to mean the
 * `step` namespace. No namespace is named after another's suffix, so trying both cannot go wrong.
 */
function candidates(token: string): readonly string[] {
  const t = token.trim();
  return t.startsWith(scopePrefix) ? [t, t.slice(scopePrefix.length)] : [t];
}

function matches(namespace: string): boolean {
  if (!pattern) {
    return false;
  }
  if (pattern === '*') {
    return true;
  }
  return pattern.split(',').some((p) => {
    return candidates(p).some((n) => {
      return namespace === n || namespace.startsWith(n + ':');
    });
  });
}

// ── Logger type ─────────────────────────────────────────────────────────────

/** The structured half of a log line, printed as the console's own last argument. */
export type LogData = Record<string, unknown>;

/**
 * `warn` and `error` are function properties rather than methods, which antumbra's twin writes as
 * shorthand: this package lints `unbound-method`, and the point of a table keyed by status is to
 * hold these three by reference.
 */
export type Logger = {
  /** Log a debug-level message with optional structured data. */
  (message: string, data?: LogData): void;
  /** Log a warning with optional structured data. */
  readonly warn: (message: string, data?: LogData) => void;
  /** Log an error with optional structured data. */
  readonly error: (message: string, data?: LogData) => void;
};

// ── Factory ─────────────────────────────────────────────────────────────────

/**
 * The badge colour for a namespace: its own, or the *nearest* ancestor's — so `step:retry` takes
 * `step`'s and a family that split its hue out keeps it down the whole branch.
 */
function resolveColor(namespace: string): string {
  if (colors[namespace]) {
    return colors[namespace];
  }
  const idx = namespace.lastIndexOf(':');
  // The unknown-namespace fallback is a badge too, so same ink: `#999` clears only 4.36:1 on it.
  return idx === -1 ? '#B0B0B0' : resolveColor(namespace.slice(0, idx));
}

/**
 * Create a namespaced logger instance.
 *
 * @param namespace - Logger namespace (e.g. `'step'`, `'plan'`)
 * @returns A callable logger with `.warn()` and `.error()` methods
 *
 * @example
 * const log = createLogger('step');
 * log('Attempt started', { step: 'session' });
 * log.error('Step failed', { step: 'session', error: err.message });
 *
 * @internal
 */
export function createLogger(namespace: string): Logger {
  const color = resolveColor(namespace);
  const prefix = `${scopePrefix}${namespace}`;

  function emit(
    method: 'debug' | 'warn' | 'error',
    line: { readonly message: string; readonly data: LogData | undefined }
  ) {
    const { message, data } = line;
    if (!matches(namespace)) {
      return;
    }
    const id = nextLogId();
    if (data === undefined) {
      console[method](
        `%c${prefix}%c %c${id}%c ${message}`,
        labelStyle(color),
        resetStyle,
        idStyle,
        resetStyle
      );
    } else {
      console[method](
        `%c${prefix}%c %c${id}%c ${message}`,
        labelStyle(color),
        resetStyle,
        idStyle,
        resetStyle,
        data
      );
    }
  }

  function log(message: string, data?: LogData): void {
    emit('debug', { message, data });
  }
  log.warn = (message: string, data?: LogData): void => {
    emit('warn', { message, data });
  };
  log.error = (message: string, data?: LogData): void => {
    emit('error', { message, data });
  };

  return log;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Enable or disable debug logging.
 *
 * Call it before `run()`: a bootstrapper's host decides when the boot happens, so there is a moment
 * to say so, and nothing is read from storage on the way.
 *
 * @param next - Namespace filter (`'*'` for all, `'step,intent'` for some), or `false` to disable.
 *
 * @example
 * import { setLogLevel, createBootstrap } from 'umbra';
 *
 * setLogLevel('*'); // every namespace
 * setLogLevel('step'); // the attempts alone
 * setLogLevel(false); // off again
 */
export function setLogLevel(next: string | false): void {
  pattern = next === false ? null : next;
}
