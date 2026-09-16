/**
 * The endpoints this demo pretends to call.
 *
 * Latencies are the point: the plan claims two module prefetches overlap, and only a call that
 * actually takes time can show it. The faults are the other point — every interesting thing a
 * bootstrap does happens when something is slow, missing or refused.
 */

export type Faults = {
  /** No session: the guard refuses the mount instead of letting a broken app render. */
  signedOut: boolean;
  /** The config endpoint is down. It is optional, so the run degrades rather than fails. */
  configDown: boolean;
  /** One module's reference data hangs past its own timeout. */
  tagsHang: boolean;
  /** Access check is broken. It is required, so the run fails. */
  accessBroken: boolean;
  /** The trial is nearly expired, which is what queues a warning for the framework. */
  trialExpiring: boolean;
};

export const defaultFaults: Faults = {
  signedOut: false,
  configDown: false,
  tagsHang: false,
  accessBroken: false,
  // Off, like the rest. This one queues an intent that a mounted step waits on, and the app's
  // answer to that is a modal dialog — so leaving it on greeted every reader with a question over
  // a page they had not read yet. The demonstration is better as something they switch on.
  trialExpiring: false,
};

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new Error('aborted'));
      },
      { once: true }
    );
  });
}

export type Api = {
  session: (signal: AbortSignal) => Promise<{
    userId: string;
    displayName: string;
    expiresAt: number;
  } | null>;
  access: (signal: AbortSignal) => Promise<readonly string[]>;
  config: (
    signal: AbortSignal
  ) => Promise<{ workspaceName: string; trialDaysLeft: number; fromCache: boolean }>;
  projects: (signal: AbortSignal) => Promise<readonly string[]>;
  tags: (signal: AbortSignal) => Promise<readonly string[]>;
};

export function createApi(faults: Faults): Api {
  return {
    session: async (signal) => {
      await wait(320, signal);
      if (faults.signedOut) {
        return null;
      }
      return { userId: 'u-4821', displayName: 'F. Desjardins', expiresAt: Date.now() + 3_600_000 };
    },

    access: async (signal) => {
      await wait(240, signal);
      if (faults.accessBroken) {
        throw new Error('The access service answered 500.');
      }
      return ['projects:read', 'tags:read', 'config:write'];
    },

    config: async (signal) => {
      await wait(410, signal);
      if (faults.configDown) {
        throw new Error('The configuration service answered 503.');
      }
      return {
        workspaceName: 'Acme Workspace',
        trialDaysLeft: faults.trialExpiring ? 12 : 240,
        fromCache: true,
      };
    },

    projects: async (signal) => {
      await wait(500, signal);
      return ['Milestones', 'Owners', 'Linked issues'];
    },

    tags: async (signal) => {
      await wait(faults.tagsHang ? 4000 : 460, signal);
      return ['Labels', 'Formats', 'Vendors'];
    },
  };
}
