import type { UiPort } from 'antumbra';

type Ask = { message: string; answer: (accepted: boolean) => void };

/**
 * The app's dialog, as something a step can reach.
 *
 * Module scope on purpose, and it is the pattern rather than a shortcut. The port has to be stable
 * — a fresh one on every render would restart the mounted phase every render — and a port is app
 * infrastructure anyway, not component state. The component below subscribes to it; it does not own
 * it.
 */
function createDialogController() {
  const listeners = new Set<(pending: Ask | undefined) => void>();
  let pending: Ask | undefined;

  const publish = (next: Ask | undefined): void => {
    pending = next;
    for (const listener of Array.from(listeners)) {
      listener(pending);
    }
  };

  return {
    ask: (message: string): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        publish({
          message,
          answer: (accepted) => {
            publish(undefined);
            resolve(accepted);
          },
        });
      });
    },
    /**
     * Void whatever is still on screen.
     *
     * A question belongs to the run that raised it. This controller is module scope — it has to be,
     * because a port must be stable — so without this the promise from a replaced run is never
     * settled and its question is still what a freshly mounted host reads as its own.
     */
    cancel: (): void => {
      pending?.answer(false);
    },
    subscribe: (listener: (pending: Ask | undefined) => void): (() => void) => {
      listeners.add(listener);
      listener(pending);
      return () => {
        listeners.delete(listener);
      };
    },
    get: (): Ask | undefined => {
      return pending;
    },
  };
}

export const dialog = createDialogController();

/** What mounted steps get as `ctx.ui`. Declared in `registry.d.ts`. */
export const uiPort: UiPort = {
  confirm: (message: string) => {
    return dialog.ask(message);
  },
};
