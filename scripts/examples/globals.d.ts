/**
 * What the examples are written as if the reader's app had declared.
 *
 * Nearly every snippet in this library reads a step by id — `ctx.get('session').userId`,
 * `useStepData('config')` — and that only types as anything once the app has augmented
 * {@link StepRegistry}. Without this file each of those reads is `unknown` and the example fails
 * on the property access, which would report the *absence of an augmentation* as a mistake in the
 * snippet; with it, what the compiler still catches is misuse of this library, which is the whole
 * point of the gate.
 *
 * The declarations mirror the ones the `@example` on `StepRegistry` itself shows a reader writing.
 * Interface merging requires a member declared twice to be declared identically, so that example
 * and this file are checked against each other on every run: change one and the check fails.
 *
 * The file carries a top-level `export {}` for a reason that is easy to lose: without one a .d.ts
 * is a global script, and `declare module 'antumbra'` in a script *declares* a module rather than
 * augmenting the real one — which then loses silently to the `paths` mapping, leaving every
 * registry read exactly as untyped as it was before this file existed.
 *
 * Not shipped and not imported by anything — it exists only in the compilation that
 * `scripts/check-examples.mjs` sets up.
 */
export {};

declare global {
  interface WorkspaceConfig {
    readonly workspaceName: string;
    readonly daysLeft: number;
  }
}

declare module 'antumbra' {
  interface StepRegistry {
    session: { userId: string; expiresAt: number };
    config: WorkspaceConfig;
  }
  interface NoticeRegistry {
    'config:from-cache': { age: number };
    'boot:offline': void;
  }
  interface IntentRegistry {
    'warn:trial-expiring': { daysLeft: number };
  }
  interface HostCapabilities {
    confirm: (message: string) => Promise<boolean>;
  }
}
