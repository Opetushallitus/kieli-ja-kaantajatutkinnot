import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { AutocompleteValue } from 'shared/components';
import { APIResponseStatus, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';

import { ControlButtons } from 'components/clerkTranslator/overview/ClerkTranslatorDetailsControlButtons';
import { ClerkTranslatorDetailsFields } from 'components/clerkTranslator/overview/ClerkTranslatorDetailsFields';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { UIMode } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  ClerkTranslator,
  ClerkTranslatorBasicInformation,
  ClerkTranslatorTextFields,
} from 'interfaces/clerkTranslator';
import {
  cancelClerkTranslatorDetailsUpdate,
  resetClerkTranslatorDetailsUpdate,
  updateClerkTranslatorDetails,
} from 'redux/reducers/clerkTranslatorOverview';
import { clerkTranslatorOverviewSelector } from 'redux/selectors/clerkTranslatorOverview';
import { NotifierUtils } from 'utils/notifier';

export const ClerkTranslatorDetails = () => {
  // Redux
  const dispatch = useAppDispatch();
  const {
    selectedTranslator,
    translatorDetailsState: { status: translatorDetailsStatus, error },
  } = useAppSelector(clerkTranslatorOverviewSelector);

  const { showToast } = useToast();
  const { showDialog } = useDialog();

  // Local State
  const [translatorDetails, setTranslatorDetails] =
    useState(selectedTranslator);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const isViewMode = currentUIMode !== UIMode.EditTranslatorDetails;
  const resetLocalTranslatorDetails = useCallback(() => {
    setTranslatorDetails(selectedTranslator);
  }, [selectedTranslator]);
  const [showToastOnError, setShowToastOnError] = useState(true);

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorOverview',
  });
  const translateCommon = useCommonTranslation();

  const resetToInitialState = useCallback(() => {
    dispatch(resetClerkTranslatorDetailsUpdate());
    resetLocalTranslatorDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [dispatch, resetLocalTranslatorDetails]);

  useEffect(() => {
    if (
      translatorDetailsStatus === APIResponseStatus.Success &&
      currentUIMode === UIMode.EditTranslatorDetails
    ) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.updated'),
      });
      resetToInitialState();
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
    showToast,
    resetToInitialState,
    t,
    translatorDetailsStatus,
  ]);

  useEffect(() => {
    if (error && showToastOnError) {
      setShowToastOnError(false);
      showToast({
        severity: Severity.Error,
        description: NotifierUtils.getAPIErrorMessage(error),
      });
    }
  }, [error, showToast, showToastOnError]);

  const handleTextFieldChange =
    (field: keyof ClerkTranslatorTextFields) =>
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      handleFieldChange(field, event.target.value);
    };

  const handleComboBoxChange =
    (field: keyof ClerkTranslatorBasicInformation) =>
    ({}, autocompleteValue?: AutocompleteValue) => {
      handleFieldChange(field, autocompleteValue?.value);
    };

  const handleCheckBoxChange =
    (field: keyof ClerkTranslatorBasicInformation) =>
    (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleFieldChange(field, checked);
    };

  const handleFieldChange = (
    field: keyof ClerkTranslatorBasicInformation,
    fieldValue: string | boolean | undefined
  ) => {
    const updatedTranslatorDetails = {
      ...translatorDetails,
      [field]: fieldValue,
    };
    setHasLocalChanges(true);
    setTranslatorDetails(updatedTranslatorDetails as ClerkTranslator);
  };

  const onSave = () => {
    setShowToastOnError(true);
    dispatch(
      updateClerkTranslatorDetails(translatorDetails as ClerkTranslator)
    );
  };

  const onEdit = () => {
    resetLocalTranslatorDetails();
    setCurrentUIMode(UIMode.EditTranslatorDetails);
  };

  const openCancelDialog = () => {
    showDialog({
      title: t('translatorDetails.cancelUpdateDialog.title'),
      severity: Severity.Info,
      description: t('translatorDetails.cancelUpdateDialog.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => dispatch(cancelClerkTranslatorDetailsUpdate()),
        },
      ],
    });
  };

  const hasRequiredDetails =
    !!translatorDetails?.firstName && !!translatorDetails.lastName;

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
      onTextFieldChange={(field: keyof ClerkTranslatorTextFields) =>
        handleTextFieldChange(field)
      }
      onComboBoxChange={(field: keyof ClerkTranslatorBasicInformation) =>
        handleComboBoxChange(field)
      }
      onCheckBoxChange={(field: keyof ClerkTranslatorBasicInformation) =>
        handleCheckBoxChange(field)
      }
      editDisabled={isViewMode}
      topControlButtons={
        <ControlButtons
          onCancel={onCancel}
          onEdit={onEdit}
          onSave={onSave}
          isViewMode={isViewMode}
          hasRequiredDetails={hasRequiredDetails}
        />
      }
      showFieldErrorBeforeChange={true}
    />
  );
};
