/**
 * What this app declares, once, so the rest of it stops writing `string` and `unknown`.
 *
 * This is the whole augmentation story in one file: an app names its steps, its notices, its
 * intents and what its framework layer can do, and every call site in the app is typed from it.
 * A project with no declarations here still works — ids stay open — which is what lets one be
 * added at a time.
 */

import type {} from 'umbra';

declare module 'umbra' {
  interface StepRegistry {
    /** Who is signed in, and until when. Everything else in the app hangs off this. */
    session: { userId: string; displayName: string; expiresAt: number };
    /** What this user may do. Separate from the session because it is a separate call. */
    access: ReadonlySet<string>;
    /** Workspace-wide settings. Optional: the app runs degraded without them. */
    config: { workspaceName: string; trialDaysLeft: number };
    /** A module's reference data, prefetched so its first screen does not spin. */
    'projects:reference': readonly string[];
    /** Another module's, fetched in parallel with the one above. */
    'tags:reference': readonly string[];
    /** A preview-only branch. Absent on any other build, and that is not a failure. */
    'debug-overlay': { workspace: string };
    /** Downstream of it, so it goes wherever the branch goes. */
    'debug-recorder': { recording: string };
  }

  interface NoticeRegistry {
    'config:from-cache': { ageSeconds: number };
    'module:unavailable': { module: string };
    'boot:degraded': void;
  }

  interface IntentRegistry {
    'warn:trial-expiring': { daysLeft: number };
    'redirect:sign-in': { returnTo: string };
    'confirm:continue-degraded': { missing: string };
  }

  interface HostCapabilities {
    /** Opens the app's own dialog and resolves with the answer. */
    confirm: (message: string) => Promise<boolean>;
  }
}
