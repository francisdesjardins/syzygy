import { AppButton } from '../AppButton.js';
import { appButtonClass } from '../button-recipe.js';

/** Every look the recipe can produce, so one mount answers for the whole table. */
export function AppButtonLooks() {
  return (
    <div>
      <AppButton data-testid="default">Default</AppButton>
      <AppButton variant="contained" data-testid="contained">
        Contained
      </AppButton>
      <AppButton variant="contained" color="error" data-testid="contained-error">
        Contained error
      </AppButton>
      <AppButton variant="outlined" data-testid="outlined">
        Outlined
      </AppButton>
      <AppButton variant="text" data-testid="text">
        Text
      </AppButton>
      <AppButton size="small" data-testid="small">
        Small
      </AppButton>
    </div>
  );
}

/**
 * The two things that cannot be an `AppButton` and take the class list instead.
 *
 * A link dressed as a button has to stay an `<a>`, or new-tab and copy-link stop working; a dialog
 * action's button is one the caller writes, because `action(...)` spreads three attributes onto it
 * that a wrapper enumerating props would drop.
 */
export function AppButtonRecipe() {
  return (
    <div>
      <a href="/somewhere" className={appButtonClass({ variant: 'contained' })} data-testid="link">
        A link
      </a>
      <button type="button" className={appButtonClass()} data-testid="hand-written">
        Hand-written
      </button>
    </div>
  );
}

/** The spread contract: anything a `<button>` takes reaches the element. */
export function AppButtonSpread() {
  return (
    <AppButton
      data-testid="spread"
      aria-keyshortcuts="Enter"
      data-action-reason="confirm"
      disabled
      title="A title"
    >
      Spread
    </AppButton>
  );
}
