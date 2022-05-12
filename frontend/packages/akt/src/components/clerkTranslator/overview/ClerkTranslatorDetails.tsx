import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Severity, Variant } from 'shared/enums';

import { ControlButtons } from 'components/clerkTranslator/overview/ClerkTranslatorDetailsControlButtons';
import { ClerkTranslatorDetailsFields } from 'components/clerkTranslator/overview/ClerkTranslatorDetailsFields';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIResponseStatus } from 'enums/api';
import { UIMode } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  ClerkTranslator,
  ClerkTranslatorBasicInformation,
} from 'interfaces/clerkTranslator';
import {
  resetClerkTranslatorDetailsUpdate,
  updateClerkTranslatorDetails,
} from 'redux/actions/clerkTranslatorOverview';
import { showNotifierDialog, showNotifierToast } from 'redux/actions/notifier';
import {
  NOTIFIER_ACTION_CLERK_TRANSLATOR_DETAILS_CANCEL_UPDATE,
  NOTIFIER_ACTION_DO_NOTHING,
} from 'redux/actionTypes/notifier';
import { clerkTranslatorOverviewSelector } from 'redux/selectors/clerkTranslatorOverview';
import { NotifierUtils } from 'utils/notifier';

export const ClerkTranslatorDetails = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { selectedTranslator, translatorDetailsStatus } = useAppSelector(
    clerkTranslatorOverviewSelector
  );

  // Local State
  const [translatorDetails, setTranslatorDetails] =
    useState(selectedTranslator);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const isViewMode = currentUIMode !== UIMode.EditTranslatorDetails;
  const resetLocalTranslatorDetails = useCallback(() => {
    setTranslatorDetails(selectedTranslator);
  }, [selectedTranslator]);

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.clerkTranslatorOverview',
  });
  const translateCommon = useCommonTranslation();

  const resetToInitialState = useCallback(() => {
    dispatch(resetClerkTranslatorDetailsUpdate);
    resetLocalTranslatorDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [dispatch, resetLocalTranslatorDetails]);

  useEffect(() => {
    if (
      translatorDetailsStatus === APIResponseStatus.Success &&
      currentUIMode === UIMode.EditTranslatorDetails
    ) {
      const toast = NotifierUtils.createNotifierToast(
        Severity.Success,
        t('toasts.updated')
      );
      dispatch(showNotifierToast(toast));
      dispatch(resetClerkTranslatorDetailsUpdate);
      setCurrentUIMode(UIMode.View);
    } else if (
      translatorDetailsStatus === APIResponseStatus.Cancelled &&
      currentUIMode === UIMode.EditTranslatorDetails
    ) {
      // Flow was reset through the cancel dialog -> reset UI state.
      resetToInitialState();
    }
  }, [
    currentUIMode,
    dispatch,
    resetToInitialState,
    t,
    translatorDetailsStatus,
  ]);

  const handleTranslatorDetailsChange =
    (field: keyof ClerkTranslatorBasicInformation) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const fieldValue =
        field === 'isAssuranceGiven'
          ? (event.target as HTMLInputElement).checked
          : event.target.value;
      const updatedTranslatorDetails = {
        ...translatorDetails,
        [field]: fieldValue,
      };
      setHasLocalChanges(true);
      setTranslatorDetails(updatedTranslatorDetails as ClerkTranslator);
    };

  const onSave = () => {
    dispatch(
      updateClerkTranslatorDetails(translatorDetails as ClerkTranslator)
    );
  };

  const onEdit = () => {
    resetLocalTranslatorDetails();
    setCurrentUIMode(UIMode.EditTranslatorDetails);
  };

  const openCancelDialog = () => {
    const dialog = NotifierUtils.createNotifierDialog(
      t('translatorDetails.cancelUpdateDialog.title'),
      Severity.Info,
      t('translatorDetails.cancelUpdateDialog.description'),
      [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
          action: NOTIFIER_ACTION_DO_NOTHING,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: NOTIFIER_ACTION_CLERK_TRANSLATOR_DETAILS_CANCEL_UPDATE,
        },
      ]
    );
    dispatch(showNotifierDialog(dialog));
  };

  const onCancel = () => {
    if (!hasLocalChanges) {
      resetToInitialState();
    } else {
      openCancelDialog();
    }
  };
  useNavigationProtection(hasLocalChanges);

  return (
    <ClerkTranslatorDetailsFields
      translator={translatorDetails}
      onFieldChange={(field: keyof ClerkTranslatorBasicInformation) =>
        handleTranslatorDetailsChange(field)
      }
      editDisabled={isViewMode}
      topControlButtons={
        <ControlButtons
          onCancel={onCancel}
          onEdit={onEdit}
          onSave={onSave}
          isViewMode={isViewMode}
        />
      }
      displayFieldErrorBeforeChange={true}
    />
  );
};
