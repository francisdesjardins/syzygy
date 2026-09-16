/**
 * The library's component-test harnesses, rendered live by `/stories` and shown here as source —
 * the largest of the three groups, for the one route that needs it. See `codeSamples.ts`.
 */
import { sliceDeclaration, sliceDeclarations } from 'limb/slice-declaration';

import storyUseDialogBasicSrc from 'antumbra/react/__tests__/use-dialog/basic.story.tsx?raw';
import storyUseDialogOpenAndWaitSrc from 'antumbra/react/__tests__/use-dialog/open-and-wait.story.tsx?raw';
import storyUseDialogNonModalSrc from 'antumbra/react/__tests__/use-dialog/non-modal.story.tsx?raw';
import storyUseDialogNonModalStackSrc from 'antumbra/react/__tests__/use-dialog/non-modal-stack.story.tsx?raw';
import storyUseDialogNonModalEscIsolationSrc from 'antumbra/react/__tests__/use-dialog/non-modal-esc-isolation.story.tsx?raw';
import storyUseDialogNonModalClickOutsideSrc from 'antumbra/react/__tests__/use-dialog/non-modal-click-outside.story.tsx?raw';
import storyUseDialogNonModalClickOutsideDefaultSrc from 'antumbra/react/__tests__/use-dialog/non-modal-click-outside-default.story.tsx?raw';
import storyUseDialogCustomDismissKeySrc from 'antumbra/react/__tests__/use-dialog/custom-dismiss-key.story.tsx?raw';
import storyUseDialogDismissKeyDisabledSrc from 'antumbra/react/__tests__/use-dialog/dismiss-key-disabled.story.tsx?raw';
import storyUseDialogNonModalCustomDismissKeySrc from 'antumbra/react/__tests__/use-dialog/non-modal-custom-dismiss-key.story.tsx?raw';
import storyUseDialogPortalDefaultSrc from 'antumbra/react/__tests__/use-dialog/portal-default.story.tsx?raw';
import storyUseDialogPortalHostSrc from 'antumbra/react/__tests__/use-dialog/portal-host.story.tsx?raw';
import storyUseDialogPortalOptInSrc from 'antumbra/react/__tests__/use-dialog/portal-opt-in.story.tsx?raw';
import storyUseDialogPortalNonModalDefaultSrc from 'antumbra/react/__tests__/use-dialog/portal-non-modal-default.story.tsx?raw';
import storyUseDialogPortalNonModalOptInSrc from 'antumbra/react/__tests__/use-dialog/portal-non-modal-opt-in.story.tsx?raw';
import storyUseDialogDismissWhilePreparingSrc from 'antumbra/react/__tests__/use-dialog/dismiss-while-preparing.story.tsx?raw';
import storyUseDialogReopenSettlesSrc from 'antumbra/react/__tests__/use-dialog/reopen-settles.story.tsx?raw';
import storyUseDialogOpenGateSrc from 'antumbra/react/__tests__/use-dialog/open-gate.story.tsx?raw';
import storyUseDialogStableIdentitySrc from 'antumbra/react/__tests__/use-dialog/stable-identity.story.tsx?raw';
import storyUseDialogBackdropHitTestSrc from 'antumbra/react/__tests__/use-dialog/backdrop-hit-test.story.tsx?raw';
import storyOutletPaintTimingSrc from 'antumbra/react/__tests__/dialog-outlet/outlet-paint-timing.story.tsx?raw';
import storyOutletTeardownSrc from 'antumbra/react/__tests__/dialog-outlet/outlet-teardown.story.tsx?raw';
import storyActionsBasicSrc from 'antumbra/actions/__tests__/use-dialog-actions/basic-controller.story.tsx?raw';
import storyActionsErrorSrc from 'antumbra/actions/__tests__/use-dialog-actions/error-controller.story.tsx?raw';
import storyActionsHotkeySrc from 'antumbra/actions/__tests__/use-dialog-actions/hotkey-controller.story.tsx?raw';
import storyActionsDefinitionSrc from 'antumbra/actions/__tests__/use-dialog-actions/definition-controller.story.tsx?raw';
import storyFocusOnOpenSrc from 'antumbra/actions/__tests__/use-dialog-actions/focus-on-open.story.tsx?raw';
import storyStackedDialogsSrc from 'antumbra/react/__tests__/use-dialog/stacked-dialogs.story.tsx?raw';
import storyNestedHotkeyScopeSrc from 'antumbra/react/__tests__/use-dialog/nested-hotkey-scope.story.tsx?raw';
import storyFocusUnderAnotherDialogSrc from 'antumbra/react/__tests__/use-dialog/focus-under-another-dialog.story.tsx?raw';
import storyEscWithoutFocusSrc from 'antumbra/react/__tests__/use-dialog/esc-without-focus.story.tsx?raw';
import storyStrandedFocusSrc from 'antumbra/core/__tests__/stranded-focus.story.tsx?raw';
import storyApplyStyleSrc from 'antumbra/core/__tests__/apply-style.story.tsx?raw';
import storyDismissRequestSrc from 'antumbra/core/__tests__/dismiss-request.story.tsx?raw';
import storyDismissKeyOwnershipSrc from 'antumbra/core/__tests__/dismiss-key-ownership.story.tsx?raw';
import storyDismissGatesSrc from 'antumbra/core/__tests__/dismiss-gates.story.tsx?raw';
import storyCloseFailureSrc from 'antumbra/core/__tests__/close-failure.story.tsx?raw';
import storyNativeCloseSrc from 'antumbra/core/__tests__/native-close.story.tsx?raw';
import storyFocusContainmentSrc from 'antumbra/core/__tests__/focus-containment.story.tsx?raw';
import storyOpeningFocusSrc from 'antumbra/core/__tests__/opening-focus-foreground.story.tsx?raw';
import storyVanillaSwapSrc from 'antumbra/vanilla/__tests__/swap.story.tsx?raw';
import storyVanillaBindSrc from 'antumbra/vanilla/__tests__/bind-dialog.story.tsx?raw';
import storySolidAppSrc from 'antumbra/solid/__tests__/solid-app.ts?raw';
import storySolidDialogSrc from 'antumbra/solid/__tests__/solid-dialog.story.tsx?raw';
import storyAccessibleNameSrc from 'antumbra/react/__tests__/use-dialog/accessible-name.story.tsx?raw';
import storyModalitySwitchSrc from 'antumbra/react/__tests__/use-dialog/modality-switch.story.tsx?raw';
import storyBusyWhilePreparingSrc from 'antumbra/react/__tests__/use-dialog/busy-while-preparing.story.tsx?raw';
import storyRenderPhaseSrc from 'antumbra/react/__tests__/use-dialog/render-phase.story.tsx?raw';
import storyStylingSurfaceSrc from 'antumbra/react/__tests__/use-dialog/styling-surface.story.tsx?raw';
import storyActionsFocusSrc from 'antumbra/actions/__tests__/use-dialog-actions/focus-restoration.story.tsx?raw';
import storyActionsDismissCollisionSrc from 'antumbra/actions/__tests__/use-dialog-actions/dismiss-key-collision.story.tsx?raw';
import storyActionsActionBasicSrc from 'antumbra/actions/__tests__/use-dialog-actions/dialog-action-basic.story.tsx?raw';
import storyActionsCustomHandlerSrc from 'antumbra/actions/__tests__/use-dialog-actions/dialog-action-custom-handler.story.tsx?raw';
import storyActionsActionHotkeySrc from 'antumbra/actions/__tests__/use-dialog-actions/dialog-action-hotkey.story.tsx?raw';
import storyActionsActionMultipleSrc from 'antumbra/actions/__tests__/use-dialog-actions/dialog-action-multiple.story.tsx?raw';
import storyActionsReasonSourceSrc from 'antumbra/actions/__tests__/use-dialog-actions/reason-source.story.tsx?raw';
import storyActionsHotkeyWhilePreparingSrc from 'antumbra/actions/__tests__/use-dialog-actions/hotkey-while-preparing.story.tsx?raw';
import storyUseDialogTransitionToggleSrc from 'antumbra/react/__tests__/use-dialog/transition-toggle.story.tsx?raw';
import storyUseDialogKeyPassthroughSrc from 'antumbra/react/__tests__/use-dialog/key-passthrough.story.tsx?raw';
import storyDmScrollLockBothOpenSrc from 'antumbra/manager/__tests__/dialog-manager/scroll-lock-both-open.story.tsx?raw';
import storyDmScrollLockTwoManagersSrc from 'antumbra/manager/__tests__/dialog-manager/scroll-lock-two-managers.story.tsx?raw';
import storyDmDialogVariantSrc from 'antumbra/manager/__tests__/dialog-manager/dialog-variant.story.tsx?raw';
import storyDmProviderIsolationSrc from 'antumbra/manager/__tests__/dialog-manager/provider-isolation.story.tsx?raw';
import storyUseDialogStructuralToggleSrc from 'antumbra/react/__tests__/use-dialog/structural-toggle.story.tsx?raw';
import storyActionsVanillaAriaSrc from 'antumbra/actions/__tests__/use-dialog-actions/vanilla-aria-keyshortcuts.story.tsx?raw';
import storyOpenRequestSrc from 'antumbra/react/__tests__/open-request.story.tsx?raw';
import storyDmImperativeSrc from 'antumbra/manager/__tests__/dialog-manager/imperative.story.tsx?raw';
import storyDmEventSubscribeSrc from 'antumbra/manager/__tests__/dialog-manager/event-subscribe.story.tsx?raw';
import storyDmMultiDialogSrc from 'antumbra/manager/__tests__/dialog-manager/multi-dialog.story.tsx?raw';
import storyDmScrollLockSrc from 'antumbra/manager/__tests__/dialog-manager/scroll-lock.story.tsx?raw';
import storyDmUnregisteredSrc from 'antumbra/manager/__tests__/dialog-manager/unregistered-no-op.story.tsx?raw';
import storyUseStoreSrc from '@/shared/lib/__tests__/use-store.story.tsx?raw';
import storyStoreContextSrc from '@/shared/lib/__tests__/create-store-context.story.tsx?raw';
import storyDmDomEventsSrc from 'antumbra/manager/__tests__/dialog-manager/dom-events.story.tsx?raw';
import storyDmLookupSrc from 'antumbra/manager/__tests__/dialog-manager/lookup.story.tsx?raw';
import storyUseLookupSrc from 'antumbra/react/__tests__/use-lookup.story.tsx?raw';
import storyActionIsRunningSrc from 'antumbra/actions/__tests__/use-dialog-actions/action-is-running.story.tsx?raw';
import storyDomSafeSpreadSrc from 'antumbra/actions/__tests__/use-dialog-actions/dom-safe-spread.story.tsx?raw';
import storySpreadContractSrc from 'antumbra/actions/__tests__/use-dialog-actions/spread-contract.story.tsx?raw';
import storyOpenEventElementSrc from 'antumbra/manager/__tests__/open-event-element.story.tsx?raw';
import storyStackPrioritySrc from 'antumbra/manager/__tests__/stack-priority.story.tsx?raw';
import storyActionErrorHotkeyRetrySrc from 'antumbra/react/__tests__/use-dialog/action-error-hotkey-retry.story.tsx?raw';
import storyContainedOverlaySrc from 'antumbra/react/__tests__/use-dialog/contained-overlay.story.tsx?raw';
import storyEscAnsweredByNobodySrc from 'antumbra/react/__tests__/use-dialog/esc-answered-by-nobody.story.tsx?raw';
import storyLabellingDiagnosticsSrc from 'antumbra/react/__tests__/use-dialog/labelling-diagnostics.story.tsx?raw';
import storyOnOpenAbortSrc from 'antumbra/react/__tests__/use-dialog/on-open-abort.story.tsx?raw';
import storyOpenAndWaitOrderingSrc from 'antumbra/react/__tests__/use-dialog/open-and-wait-ordering.story.tsx?raw';
import storyPrepareFailureSrc from 'antumbra/react/__tests__/use-dialog/prepare-failure.story.tsx?raw';
import storyReconcileOpenSrc from 'antumbra/react/__tests__/use-dialog/reconcile-open.story.tsx?raw';
import storyRestoreNotInFrontSrc from 'antumbra/react/__tests__/use-dialog/restore-not-in-front.story.tsx?raw';
import storyShadowRootSrc from 'antumbra/react/__tests__/use-dialog/shadow-root.story.tsx?raw';
import storyVolatileKeyDownSrc from 'antumbra/react/__tests__/use-dialog/volatile-keydown.story.tsx?raw';
import storyOutletBasicSrc from 'antumbra/react/__tests__/dialog-outlet/outlet-basic.story.tsx?raw';
import storyOutletNullDialogSrc from 'antumbra/react/__tests__/dialog-outlet/outlet-null-dialog.story.tsx?raw';
import storyOutletNoOutletSrc from 'antumbra/react/__tests__/dialog-outlet/no-outlet.story.tsx?raw';
import storyOutletMultiSrc from 'antumbra/react/__tests__/dialog-outlet/outlet-multi.story.tsx?raw';
import storyOutletNestedSrc from 'antumbra/react/__tests__/dialog-outlet/outlet-nested.story.tsx?raw';
import storyMsgBasicSrc from 'antumbra/react/__tests__/use-message-dialog/basic-message.story.tsx?raw';
import storyMsgOpenAndWaitSrc from 'antumbra/react/__tests__/use-message-dialog/open-and-wait-message.story.tsx?raw';
import storyMsgAsyncOpenSrc from 'antumbra/react/__tests__/use-message-dialog/async-open-message.story.tsx?raw';
import storyMsgDataSrc from 'antumbra/react/__tests__/use-message-dialog/data-message.story.tsx?raw';
import storySlideBasicSrc from 'antumbra/react/__tests__/use-slide-dialog/basic-slide.story.tsx?raw';
import storySlideDirectionSrc from 'antumbra/react/__tests__/use-slide-dialog/direction-slide.story.tsx?raw';
import storySlideOpenAndWaitSrc from 'antumbra/react/__tests__/use-slide-dialog/open-and-wait-slide.story.tsx?raw';
import storySlideMultiDirectionSrc from 'antumbra/react/__tests__/use-slide-dialog/multi-direction-slide.story.tsx?raw';
import storySlideNonModalEscHotkeySrc from 'antumbra/react/__tests__/use-slide-dialog/non-modal-esc-hotkey.story.tsx?raw';

/**
 * The `bindDialog` harnesses share one file, so each card is cut from it by name — eighteen cards
 * pointed at the same sixteen hundred lines would show the reader everything except the subject.
 */
/**
 * A Solid card's subject is the un-exported `*App` function; the `Solid*App` export beside it is
 * three lines of provider, and the harness three more of React hosting. Two of these are one
 * parameterised builder read twice, hence a list per card rather than a name.
 */
const SOLID_CARDS: ReadonlyArray<readonly [key: string, names: readonly string[]]> = [
  ['story-solid-basic', ['BasicApp']],
  ['story-solid-busy', ['BusyApp']],
  ['story-solid-labelling', ['LabellingApp']],
  ['story-solid-live-state', ['LiveStateApp']],
  ['story-solid-declaration', ['DeclarationApp']],
  ['story-solid-outlet', ['OutletInner', 'SolidOutletApp']],
  ['story-solid-slide', ['SlideApp']],
  ['story-solid-message', ['MessageApp']],
  ['story-solid-disposal', ['DisposalInner', 'DisposalApp']],
  ['story-solid-outlet-disposal', ['OutletDisposalInner', 'OutletDisposalApp']],
  ['story-solid-portal', ['PortalApp']],
  ['story-solid-portal-host', ['PortalHostApp']],
  ['story-solid-dismiss-request', ['DismissRequestApp']],
  ['story-solid-contained', ['ContainedApp']],
  ['story-solid-stack-priority', ['stackPriorityApp', 'SolidStackPriorityApp']],
  ['story-solid-gate', ['GateApp', 'SolidGateApp']],
  ['story-solid-open-order', ['stackPriorityApp', 'SolidOpenOrderApp']],
  ['story-solid-non-modal-options', ['NonModalOptionsApp']],
  ['story-solid-reconcile', ['ReconcileApp']],
  ['story-solid-failed-action', ['FailedActionApp']],
  ['story-solid-claimless-reclaim', ['ClaimlessReclaimApp']],
  ['story-solid-prepare-failure', ['PrepareFailureApp']],
  ['story-solid-move-focus', ['MoveFocusApp']],
  ['story-solid-restore-focus-to', ['RestoreFocusToApp']],
];
const VANILLA_CARDS: ReadonlyArray<readonly [key: string, exportName: string]> = [
  ['story-vanilla-basic', 'VanillaBasicHarness'],
  ['story-vanilla-unbind', 'VanillaUnbindHarness'],
  ['story-vanilla-failing-action', 'VanillaFailingActionHarness'],
  ['story-vanilla-contained', 'VanillaContainedHarness'],
  ['story-vanilla-explicit-host', 'VanillaExplicitHostHarness'],
  ['story-vanilla-no-host', 'VanillaNoHostHarness'],
  ['story-vanilla-destroy', 'VanillaDestroyHarness'],
  ['story-vanilla-open-request', 'VanillaOpenRequestHarness'],
  ['story-vanilla-gate', 'VanillaGateHarness'],
  ['story-vanilla-dismiss-request', 'VanillaDismissRequestHarness'],
  ['story-vanilla-shadow-root', 'VanillaShadowRootHarness'],
  ['story-vanilla-restore-on-unbind', 'VanillaRestoreOnUnbindHarness'],
  ['story-vanilla-busy', 'VanillaBusyHarness'],
  ['story-vanilla-labelling', 'VanillaLabellingHarness'],
  ['story-vanilla-shadow-stack', 'VanillaShadowStackHarness'],
  ['story-vanilla-portal', 'VanillaPortalHarness'],
  ['story-vanilla-non-modal-options', 'VanillaNonModalOptionsHarness'],
  ['story-vanilla-reconcile', 'VanillaReconcileHarness'],
  ['story-vanilla-claimless-reclaim', 'VanillaClaimlessReclaimHarness'],
  ['story-vanilla-move-focus', 'VanillaMoveFocusHarness'],
  ['story-vanilla-restore-focus-to', 'VanillaRestoreFocusToHarness'],
  ['story-vanilla-prepare-failure', 'VanillaPrepareFailureHarness'],
];

export const stories: Record<string, string> = {
  ...Object.fromEntries(
    SOLID_CARDS.map(([key, names]) => {
      return [key, sliceDeclarations(storySolidAppSrc, names)];
    })
  ),
  // The mount target is this one's subject, so it is the wrapper that is shown, with the app it hosts.
  'story-solid-shadow-root': sliceDeclarations(storySolidDialogSrc, ['SolidShadowRoot']).concat(
    '\n\n',
    sliceDeclarations(storySolidAppSrc, ['BasicApp'])
  ),
  ...Object.fromEntries(
    VANILLA_CARDS.map(([key, exportName]) => {
      return [key, sliceDeclaration(storyVanillaBindSrc, exportName)];
    })
  ),
  'story-use-dialog-basic': storyUseDialogBasicSrc,
  'story-use-dialog-open-and-wait': storyUseDialogOpenAndWaitSrc,
  'story-use-dialog-non-modal': storyUseDialogNonModalSrc,
  'story-use-dialog-non-modal-stack': storyUseDialogNonModalStackSrc,
  'story-use-dialog-non-modal-esc-isolation': storyUseDialogNonModalEscIsolationSrc,
  'story-use-dialog-non-modal-click-outside': storyUseDialogNonModalClickOutsideSrc,
  'story-use-dialog-non-modal-click-outside-default': storyUseDialogNonModalClickOutsideDefaultSrc,
  'story-use-dialog-custom-dismiss-key': storyUseDialogCustomDismissKeySrc,
  'story-use-dialog-dismiss-key-disabled': storyUseDialogDismissKeyDisabledSrc,
  'story-use-dialog-non-modal-custom-dismiss-key': storyUseDialogNonModalCustomDismissKeySrc,
  'story-use-dialog-portal-default': storyUseDialogPortalDefaultSrc,
  'story-use-dialog-portal-host': storyUseDialogPortalHostSrc,
  'story-use-dialog-portal-opt-in': storyUseDialogPortalOptInSrc,
  'story-use-dialog-portal-non-modal-default': storyUseDialogPortalNonModalDefaultSrc,
  'story-use-dialog-portal-non-modal-opt-in': storyUseDialogPortalNonModalOptInSrc,
  'story-use-dialog-dismiss-while-preparing-disabled': storyUseDialogDismissWhilePreparingSrc,
  'story-use-dialog-dismiss-while-preparing-default': storyUseDialogDismissWhilePreparingSrc,
  'story-use-dialog-reopen-settles': storyUseDialogReopenSettlesSrc,
  'story-use-dialog-open-gate': storyUseDialogOpenGateSrc,
  'story-use-dialog-stable-identity': storyUseDialogStableIdentitySrc,
  'story-use-dialog-backdrop-hit-test': storyUseDialogBackdropHitTestSrc,
  'story-outlet-paint-timing': storyOutletPaintTimingSrc,
  'story-outlet-teardown': storyOutletTeardownSrc,
  'story-action-basic': storyActionsBasicSrc,
  'story-action-error': storyActionsErrorSrc,
  'story-action-hotkey': storyActionsHotkeySrc,
  'story-action-definition': storyActionsDefinitionSrc,
  'story-focus-on-open': storyFocusOnOpenSrc,
  'story-stacked-dialogs': storyStackedDialogsSrc,
  'story-nested-hotkey-scope': storyNestedHotkeyScopeSrc,
  'story-focus-under-another-dialog': storyFocusUnderAnotherDialogSrc,
  'story-esc-without-focus': storyEscWithoutFocusSrc,
  'story-stranded-focus': storyStrandedFocusSrc,
  'story-apply-style': storyApplyStyleSrc,
  'story-dismiss-request': storyDismissRequestSrc,
  'story-dismiss-key-ownership': storyDismissKeyOwnershipSrc,
  'story-dismiss-gates': storyDismissGatesSrc,
  'story-close-failure': storyCloseFailureSrc,
  'story-native-close': storyNativeCloseSrc,
  'story-focus-containment': storyFocusContainmentSrc,
  'story-opening-focus-foreground': storyOpeningFocusSrc,
  'story-vanilla-swap': storyVanillaSwapSrc,
  'story-accessible-name': storyAccessibleNameSrc,
  'story-modality-switch': storyModalitySwitchSrc,
  'story-busy-while-preparing': storyBusyWhilePreparingSrc,
  'story-render-phase': storyRenderPhaseSrc,
  'story-styling-surface': storyStylingSurfaceSrc,
  'story-action-focus': storyActionsFocusSrc,
  'story-action-dismiss-collision': storyActionsDismissCollisionSrc,
  'story-action-action-basic': storyActionsActionBasicSrc,
  'story-action-action-custom-handler': storyActionsCustomHandlerSrc,
  'story-action-action-hotkey': storyActionsActionHotkeySrc,
  'story-action-action-multiple': storyActionsActionMultipleSrc,
  'story-action-reason-source': storyActionsReasonSourceSrc,
  'story-action-hotkey-while-preparing': storyActionsHotkeyWhilePreparingSrc,
  'story-use-dialog-transition-toggle': storyUseDialogTransitionToggleSrc,
  'story-use-dialog-key-passthrough': storyUseDialogKeyPassthroughSrc,
  'story-dm-scroll-lock-both-open': storyDmScrollLockBothOpenSrc,
  'story-dm-scroll-lock-two-managers': storyDmScrollLockTwoManagersSrc,
  'story-dm-dialog-variant': storyDmDialogVariantSrc,
  'story-dm-dialog-variant-lookup': storyDmDialogVariantSrc,
  'story-dm-provider-isolation': storyDmProviderIsolationSrc,
  'story-dm-no-provider': storyDmProviderIsolationSrc,
  'story-use-dialog-structural-toggle': storyUseDialogStructuralToggleSrc,
  'story-action-vanilla-aria': storyActionsVanillaAriaSrc,
  'story-action-broken-aria': storyActionsVanillaAriaSrc,
  'story-open-request': storyOpenRequestSrc,
  'story-dm-imperative': storyDmImperativeSrc,
  'story-dm-event-subscribe': storyDmEventSubscribeSrc,
  'story-dm-multi-dialog': storyDmMultiDialogSrc,
  'story-dm-scroll-lock': storyDmScrollLockSrc,
  'story-dm-unregistered': storyDmUnregisteredSrc,
  'story-store-use-store': storyUseStoreSrc,
  'story-store-context': storyStoreContextSrc,
  'story-dm-dom-events': storyDmDomEventsSrc,
  'story-dm-lookup-find': storyDmLookupSrc,
  'story-dm-lookup-collection': storyDmLookupSrc,
  'story-dm-lookup-foreground': storyDmLookupSrc,
  'story-dm-lookup-unregistered': storyDmLookupSrc,
  'story-use-lookup-basic': storyUseLookupSrc,
  'story-action-is-running': storyActionIsRunningSrc,
  'story-dom-safe-spread': storyDomSafeSpreadSrc,
  'story-spread-contract': storySpreadContractSrc,
  'story-open-event-element': storyOpenEventElementSrc,
  'story-stack-priority-extra': storyStackPrioritySrc,
  'story-action-error-hotkey-retry': storyActionErrorHotkeyRetrySrc,
  'story-contained-overlay': storyContainedOverlaySrc,
  'story-esc-answered-by-nobody': storyEscAnsweredByNobodySrc,
  'story-labelling-diagnostics': storyLabellingDiagnosticsSrc,
  'story-on-open-abort': storyOnOpenAbortSrc,
  'story-open-and-wait-ordering': storyOpenAndWaitOrderingSrc,
  'story-prepare-failure': storyPrepareFailureSrc,
  'story-reconcile-open': storyReconcileOpenSrc,
  'story-restore-not-in-front': storyRestoreNotInFrontSrc,
  'story-shadow-root': storyShadowRootSrc,
  'story-volatile-keydown': storyVolatileKeyDownSrc,
  'story-use-lookup-unregistered': storyUseLookupSrc,
  'story-use-lookup-foreground': storyUseLookupSrc,
  'story-outlet-basic': storyOutletBasicSrc,
  'story-outlet-null-dialog': storyOutletNullDialogSrc,
  'story-outlet-no-outlet': storyOutletNoOutletSrc,
  'story-outlet-multi': storyOutletMultiSrc,
  'story-outlet-nested': storyOutletNestedSrc,
  'story-msg-basic': storyMsgBasicSrc,
  'story-msg-open-and-wait': storyMsgOpenAndWaitSrc,
  'story-msg-async-open': storyMsgAsyncOpenSrc,
  'story-msg-data': storyMsgDataSrc,
  'story-slide-basic': storySlideBasicSrc,
  'story-slide-direction': storySlideDirectionSrc,
  'story-slide-open-and-wait': storySlideOpenAndWaitSrc,
  'story-slide-multi-direction': storySlideMultiDirectionSrc,
  'story-slide-non-modal-esc-hotkey': storySlideNonModalEscHotkeySrc,
};
