import { Dayjs } from 'dayjs';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { AutocompleteValue } from 'shared/components';
import { APIResponseStatus, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { DateUtils, StringUtils } from 'shared/utils';

import { ControlButtons } from 'components/clerkExamEvent/overview/ClerkExamEventDetailsControlButtons';
import { ClerkExamEventDetailsFields } from 'components/clerkExamEvent/overview/ClerkExamEventDetailsFields';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { UIMode } from 'enums/app';
import {
  ClerkExamEvent,
  ClerkExamEventBasicInformation,
} from 'interfaces/clerkExamEvent';
import {
  resetClerkExamEventDetailsUpdate,
  updateClerkExamEventDetails,
} from 'redux/reducers/clerkExamEventOverview';
import { clerkExamEventOverviewSelector } from 'redux/selectors/clerkExamEventOverview';

export const ClerkExamEventDetails = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { examEvent, examEventDetailsStatus } = useAppSelector(
    clerkExamEventOverviewSelector
  );

  const { showToast } = useToast();
  const { showDialog } = useDialog();

  // Local state
  const [examEventDetails, setExamEventDetails] = useState(examEvent);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const isViewMode = currentUIMode !== UIMode.EditExamEventDetails;

  const resetLocalExamEventDetails = useCallback(() => {
    setExamEventDetails(examEvent);
  }, [examEvent]);

  // I18n
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventOverview',
  });
  const translateCommon = useCommonTranslation();

  const resetToInitialState = useCallback(() => {
    dispatch(resetClerkExamEventDetailsUpdate());
    resetLocalExamEventDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [dispatch, resetLocalExamEventDetails]);

  useEffect(() => {
    if (
      examEventDetailsStatus === APIResponseStatus.Success &&
      currentUIMode === UIMode.EditExamEventDetails
    ) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.updated'),
      });
      resetToInitialState();
    } else if (
      examEventDetailsStatus === APIResponseStatus.Cancelled &&
      currentUIMode === UIMode.EditExamEventDetails
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
    examEventDetailsStatus,
  ]);

  const hasRequiredDetails = examEventDetails
    ? StringUtils.isNonBlankString(examEventDetails.language) &&
      StringUtils.isNonBlankString(examEventDetails.level) &&
      DateUtils.isValidDate(examEventDetails.date) &&
      DateUtils.isValidDate(examEventDetails.registrationCloses) &&
      DateUtils.isDatePartBefore(
        examEventDetails.registrationCloses,
        examEventDetails.date
      )
    : false;

  const handleComboBoxChange =
    (field: keyof ClerkExamEventBasicInformation) =>
    ({}, autocompleteValue?: AutocompleteValue) => {
      handleFieldChange(field, autocompleteValue?.value);
    };

  const handleCheckBoxChange =
    (field: keyof ClerkExamEventBasicInformation) =>
    (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleFieldChange(field, checked);
    };

  const handleDateChange =
    (
      field: keyof Pick<
        ClerkExamEventBasicInformation,
        'date' | 'registrationCloses'
      >
    ) =>
    (date: Dayjs | null) => {
      handleFieldChange(field, date);
    };

  const handleFieldChange = (
    field: keyof ClerkExamEventBasicInformation,
    fieldValue: string | boolean | undefined | Dayjs | null
  ) => {
    const updatedExamEventDetails = {
      ...examEventDetails,
      [field]: fieldValue,
    };
    setHasLocalChanges(true);
    setExamEventDetails(updatedExamEventDetails as ClerkExamEvent);
  };

  const onSave = () => {
    dispatch(updateClerkExamEventDetails(examEventDetails as ClerkExamEvent));
  };

  const onEdit = () => {
    resetLocalExamEventDetails();
    setCurrentUIMode(UIMode.EditExamEventDetails);
  };

  const openCancelDialog = () => {
    showDialog({
      title: t('examEventDetails.cancelUpdateDialog.title'),
      severity: Severity.Info,
      description: t('examEventDetails.cancelUpdateDialog.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => resetToInitialState(),
        },
      ],
    });
  };

  const onCancel = () => {
    if (!hasLocalChanges) {
      resetToInitialState();
    } else {
      openCancelDialog();
    }
  };

  return (
    <ClerkExamEventDetailsFields
      examEvent={examEventDetails}
      onComboBoxChange={(field: keyof ClerkExamEventBasicInformation) =>
        handleComboBoxChange(field)
      }
      onDateChange={(
        field: keyof Pick<
          ClerkExamEventBasicInformation,
          'date' | 'registrationCloses'
        >
      ) => handleDateChange(field)}
      onCheckBoxChange={(field: keyof ClerkExamEventBasicInformation) =>
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
    />
  );
};
