import { useIntentHost } from 'antumbra/react';
import type { ForwardedIntent, Intent } from 'antumbra/react';
import { useEffect, useRef, useState } from 'react';
import { dialog, uiPort } from '@/pages/getting-started/examples/ui-port.js';
import { AppButton } from '@/shared/ui/AppButton';
import styles from '@/pages/getting-started/ui/IntentDialog.module.css';

type Question =
  | { source: 'port'; message: string; answer: (accepted: boolean) => void }
  | { source: 'intent'; message: string; entry: ForwardedIntent };

/**
 * The app's own dialog, and the library knows nothing about it.
 *
 * This is what the two-phase design exists for: the preflight queued intents it had no way to act
 * on, and here is the markup that acts on them. antumbra ships no UI, so the `<dialog>`, its buttons
 * and its wording are the app's.
 *
 * **The question is derived, not raised from an effect.** Asking imperatively meant an effect whose
 * job was to call `dialog.ask` once, and StrictMode runs an effect twice before the state that would
 * have stopped the second call has flushed — so the same warning opened two dialogs. Reading the
 * queue and rendering the first unanswered entry has no such window.
 */
export function IntentHost() {
  const pending = useIntentHost(uiPort);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [portQuestion, setPortQuestion] = useState(dialog.get);
  const [answered, setAnswered] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const unsubscribe = dialog.subscribe(setPortQuestion);
    return () => {
      unsubscribe();
      // This host is the run's. When it goes, so does any question the run was still asking.
      dialog.cancel();
    };
  }, []);

  const nextIntent = pending.find((entry) => {
    return !answered.has(entry.intent.id);
  });

  // A mounted step asking through the port wins: it is blocking on the answer, where a queued
  // warning is not.
  const question: Question | undefined =
    portQuestion === undefined
      ? nextIntent === undefined
        ? undefined
        : { source: 'intent', message: describe(nextIntent.intent), entry: nextIntent }
      : { source: 'port', message: portQuestion.message, answer: portQuestion.answer };

  // Depends on whether there is a question, not on which one. `question` is a fresh object every
  // render, so depending on it would reopen the dialog on every keystroke elsewhere in the page —
  // and listing it anyway with the check switched off would hide the next dependency too.
  const hasQuestion = question !== undefined;
  useEffect(() => {
    const node = dialogRef.current;
    if (node === null) {
      return;
    }
    if (hasQuestion && !node.open) {
      node.showModal();
    }
    if (!hasQuestion && node.open) {
      node.close();
    }
  }, [hasQuestion]);

  const answer = (accepted: boolean): void => {
    if (question === undefined) {
      return;
    }
    if (question.source === 'port') {
      question.answer(accepted);
      return;
    }
    setAnswered((previous) => {
      return new Set(previous).add(question.entry.intent.id);
    });
    if (accepted) {
      question.entry.controls.settle();
    } else {
      question.entry.controls.drop('dismissed by the user');
    }
  };

  return (
    <dialog ref={dialogRef} className={styles['dialog']} aria-labelledby="intent-dialog-title">
      <h2 id="intent-dialog-title" className={styles['title']}>
        The app is asking
      </h2>
      <p data-testid="dialog-message" className={styles['message']}>
        {question?.message ?? ''}
      </p>
      <div className={styles['actions']}>
        <AppButton
          onClick={() => {
            answer(false);
          }}
        >
          Dismiss
        </AppButton>
        <AppButton
          variant="primary"
          data-testid="dialog-acknowledge"
          onClick={() => {
            answer(true);
          }}
        >
          Acknowledge
        </AppButton>
      </div>
    </dialog>
  );
}

function describe(intent: Intent): string {
  if (intent.type === 'warn:trial-expiring') {
    const payload: { daysLeft?: number } = asRecord(intent.payload);
    return `The trial expires in ${String(payload.daysLeft ?? 0)} days. Acknowledge?`;
  }
  if (intent.type === 'redirect:sign-in') {
    return 'This app would send you to the sign-in page. Pretend it did?';
  }
  return `${String(intent.type)} — acknowledge?`;
}

function asRecord(value: unknown): Record<string, number | undefined> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, number | undefined>)
    : {};
}
