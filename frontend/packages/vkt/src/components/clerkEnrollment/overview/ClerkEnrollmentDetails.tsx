import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { APIResponseStatus, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { StringUtils } from 'shared/utils';

import { ClerkEnrollmentDetailsFields } from 'components/clerkEnrollment/overview/ClerkEnrollmentDetailsFields';
import { ControlButtons } from 'components/clerkExamEvent/ControlButtons';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { UIMode } from 'enums/app';
import { ClerkEnrollmentTextFieldEnum } from 'enums/clerkEnrollment';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { ClerkEnrollment } from 'interfaces/clerkExamEvent';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import {
  resetClerkEnrollmentDetailsUpdate,
  updateClerkEnrollmentDetails,
} from 'redux/reducers/clerkEnrollmentDetails';
import { clerkEnrollmentDetailsSelector } from 'redux/selectors/clerkEnrollmentDetails';
import { clerkExamEventOverviewSelector } from 'redux/selectors/clerkExamEventOverview';
import { EnrollmentUtils } from 'utils/enrollment';

export const ClerkEnrollmentDetails = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { status, enrollment } = useAppSelector(clerkEnrollmentDetailsSelector);
  const { examEvent } = useAppSelector(clerkExamEventOverviewSelector);

  const { showToast } = useToast();
  const { showDialog } = useDialog();

  // Local state
  const [enrollmentDetails, setEnrollmentDetails] = useState<
    ClerkEnrollment | undefined
  >(enrollment);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const isViewMode = currentUIMode === UIMode.View;

  const resetLocalEnrollmentDetails = useCallback(() => {
    setEnrollmentDetails(enrollment);
  }, [enrollment]);

  // I18n
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentDetails',
  });
  const translateCommon = useCommonTranslation();

  const resetToInitialState = useCallback(() => {
    dispatch(resetClerkEnrollmentDetailsUpdate());
    resetLocalEnrollmentDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [dispatch, resetLocalEnrollmentDetails]);

  useNavigationProtection(hasLocalChanges);

  useEffect(() => {
    if (status === APIResponseStatus.Success && currentUIMode === UIMode.Edit) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.updated'),
      });
      resetToInitialState();
    }
  }, [currentUIMode, showToast, resetToInitialState, t, status]);

  if (!enrollmentDetails || !examEvent) {
    return null;
  }

  const hasRequiredDetails =
    StringUtils.isNonBlankString(enrollmentDetails.email) &&
    StringUtils.isNonBlankString(enrollmentDetails.phoneNumber) &&
    EnrollmentUtils.isValidPartialExamsAndSkills(enrollmentDetails);

  const handleTextFieldChange =
    (field: ClerkEnrollmentTextFieldEnum) =>
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      handleFieldChange(field, event.target.value);
    };

  const handleCheckboxFieldChange = (
    field:
      | keyof PartialExamsAndSkills
      | keyof Pick<ClerkEnrollment, 'digitalCertificateConsent'>,
    fieldValue: boolean
  ) => {
    handleFieldChange(field, fieldValue);
  };

  const handleFieldChange = (
    field:
      | ClerkEnrollmentTextFieldEnum
      | keyof PartialExamsAndSkills
      | keyof Pick<ClerkEnrollment, 'digitalCertificateConsent'>,
    fieldValue: string | boolean
  ) => {
    setHasLocalChanges(true);
    setEnrollmentDetails((prevState) => {
      if (!prevState) {
        return undefined;
      }

      let updatedEnrollmentDetails;
      if (
        field === ClerkEnrollmentTextFieldEnum.FirstName ||
        field === ClerkEnrollmentTextFieldEnum.LastName
      ) {
        updatedEnrollmentDetails = {
          ...prevState,
          person: {
            ...prevState.person,
            [field]: fieldValue,
          },
        };
      } else {
        updatedEnrollmentDetails = {
          ...prevState,
          [field]: fieldValue,
        };
      }

      return updatedEnrollmentDetails;
    });
  };

  const onSave = () => {
    dispatch(
      updateClerkEnrollmentDetails({
        enrollment: enrollmentDetails,
        examEvent: examEvent,
      })
    );
  };

  const onEdit = () => {
    resetLocalEnrollmentDetails();
    setCurrentUIMode(UIMode.Edit);
  };

  const openCancelDialog = () => {
    showDialog({
      title: translateCommon('cancelUpdateDialog.header'),
      severity: Severity.Info,
      description: translateCommon('cancelUpdateDialog.description'),
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
    <ClerkEnrollmentDetailsFields
      showFieldErrorBeforeChange={false}
      enrollment={enrollmentDetails}
      onTextFieldChange={handleTextFieldChange}
      onCheckboxFieldChange={handleCheckboxFieldChange}
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
