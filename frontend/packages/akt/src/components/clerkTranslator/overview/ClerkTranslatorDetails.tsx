import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { ControlButtons } from 'components/clerkTranslator/overview/ClerkTranslatorDetailsControlButtons';
import { ClerkTranslatorDetailsFields } from 'components/clerkTranslator/overview/ClerkTranslatorDetailsFields';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIResponseStatus } from 'enums/api';
import { Severity, UIMode, Variant } from 'enums/app';
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
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const isViewMode = currentUIMode !== UIMode.EditTranslatorDetails;
  const resetLocalStateFromRedux = useCallback(() => {
    setTranslatorDetails(selectedTranslator);
  }, [selectedTranslator]);

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.clerkTranslatorOverview',
  });
  const translateCommon = useCommonTranslation();

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
      dispatch(resetClerkTranslatorDetailsUpdate);
      resetLocalStateFromRedux();
      setCurrentUIMode(UIMode.View);
    }
  }, [
    currentUIMode,
    dispatch,
    resetLocalStateFromRedux,
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

      setTranslatorDetails(updatedTranslatorDetails as ClerkTranslator);
    };

  const handleSaveBtnClick = () => {
    dispatch(
      updateClerkTranslatorDetails(translatorDetails as ClerkTranslator)
    );
  };

  const handleEditBtnClick = () => {
    resetLocalStateFromRedux();
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

  return (
    <ClerkTranslatorDetailsFields
      translator={translatorDetails}
      onFieldChange={(field: keyof ClerkTranslatorBasicInformation) =>
        handleTranslatorDetailsChange(field)
      }
      editDisabled={isViewMode}
      topControlButtons={
        <ControlButtons
          onCancelBtnClick={openCancelDialog}
          onEditBtnClick={handleEditBtnClick}
          onSaveBtnClick={handleSaveBtnClick}
          isViewMode={isViewMode}
        />
      }
      displayFieldErrorBeforeChange={true}
    />
  );
};
