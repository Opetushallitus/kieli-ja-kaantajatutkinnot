import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { CustomButton } from 'shared/components';
import {
  APIResponseStatus,
  Color,
  Duration,
  Severity,
  Variant,
} from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { StringUtils } from 'shared/utils';

import { ClerkEnrollmentAppointmentDetailsFields } from 'components/clerkEnrollment/appointment/ClerkEnrollmentAppointmentDetailsFields';
import { ControlButtons } from 'components/clerkEnrollment/overview/ControlButtons';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { EnrollmentAppointmentStatus, UIMode } from 'enums/app';
import { ClerkEnrollmentTextFieldEnum } from 'enums/clerkEnrollment';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { ClerkEnrollmentAppointment } from 'interfaces/clerkEnrollment';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import { ExaminerExamEvent } from 'interfaces/examinerExamEvent';
import {
  cancelClerkEnrollmentAppointment,
  resetClerkEnrollmentDetails,
  resetClerkEnrollmentDetailsToInitialState,
  updateClerkEnrollmentAppointment,
} from 'redux/reducers/clerkEnrollmentAppointment';
import { clerkEnrollmentAppointmentSelector } from 'redux/selectors/clerkEnrollmentAppointment';
import { EnrollmentUtils } from 'utils/enrollment';

export const ClerkEnrollmentAppointmentDetails = ({
  enrollment,
  examEvents,
  editMode,
  oid,
}: {
  enrollment: ClerkEnrollmentAppointment;
  examEvents: Array<ExaminerExamEvent>;
  editMode: boolean;
  oid: string;
}) => {
  // Redux
  const dispatch = useAppDispatch();
  const { status, cancelStatus, updateStatus } = useAppSelector(
    clerkEnrollmentAppointmentSelector,
  );

  const { showToast } = useToast();
  const { showDialog } = useDialog();

  // Local state
  const [enrollmentDetails, setEnrollmentDetails] = useState<
    ClerkEnrollmentAppointment | undefined
  >(enrollment);
  const [newExamEvent, setNewExamEvent] = useState<
    ExaminerExamEvent | undefined
  >(enrollment.examEvent);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(
    editMode ? UIMode.Edit : UIMode.View,
  );
  const isViewMode = currentUIMode === UIMode.View;

  const resetLocalEnrollmentDetails = useCallback(() => {
    setEnrollmentDetails(enrollment);
  }, [enrollment]);

  // I18n
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentDetails',
  });
  const translateCommon = useCommonTranslation();
  const isLoading = status === APIResponseStatus.InProgress;

  const resetToInitialState = useCallback(() => {
    dispatch(resetClerkEnrollmentDetails());
    resetLocalEnrollmentDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [dispatch, resetLocalEnrollmentDetails]);

  useNavigationProtection(hasLocalChanges);

  useEffect(() => {
    if (
      updateStatus === APIResponseStatus.Success &&
      currentUIMode === UIMode.Edit
    ) {
      const description = t('toasts.updated');

      showToast({
        severity: Severity.Success,
        description,
      });
      resetToInitialState();
    }
  }, [currentUIMode, showToast, resetToInitialState, t, updateStatus]);

  useEffect(() => {
    if (cancelStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.updated'),
        timeOut: Duration.Short,
      });

      dispatch(resetClerkEnrollmentDetailsToInitialState());
      resetToInitialState();
    }
  }, [dispatch, cancelStatus, t, showToast, resetToInitialState]);

  if (!enrollmentDetails) {
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
      | keyof Pick<ClerkEnrollmentAppointment, 'digitalCertificateConsent'>,
    fieldValue: boolean,
  ) => {
    handleFieldChange(field, fieldValue);
  };

  const handleFieldChange = (
    field:
      | ClerkEnrollmentTextFieldEnum
      | keyof PartialExamsAndSkills
      | keyof Pick<ClerkEnrollmentAppointment, 'digitalCertificateConsent'>,
    fieldValue: string | boolean,
  ) => {
    setHasLocalChanges(true);
    setEnrollmentDetails((prevState) => {
      if (!prevState) {
        return undefined;
      }

      return {
        ...prevState,
        [field]: fieldValue,
      };
    });
  };

  const handleExamEventChange = (examEvent: string | undefined) => {
    if (examEvent) {
      const foundExamEvent = examEvents.find((e) => e.id === +examEvent);

      if (foundExamEvent) {
        setHasLocalChanges(true);
        setNewExamEvent(foundExamEvent);
      }
    }
  };

  const handleSaveButtonClick = () => {
    dispatch(
      updateClerkEnrollmentAppointment({
        oid,
        enrollment: {
          ...enrollmentDetails,
          understandingSkill:
            enrollmentDetails.speechComprehensionPartialExam &&
            enrollmentDetails.readingComprehensionPartialExam,
          examEvent: newExamEvent ?? enrollment.examEvent,
        },
      }),
    );
  };

  const handleEditButtonClick = () => {
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

  const handleCancelEnrollmentButtonClick = () => {
    showDialog({
      title: t('cancelEnrollmentDialog.header'),
      severity: Severity.Warning,
      description: t('cancelEnrollmentDialog.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () =>
            dispatch(
              cancelClerkEnrollmentAppointment({
                id: enrollment.id,
                oid,
              }),
            ),
        },
      ],
    });
  };

  const handleCancelButtonClick = () => {
    if (!hasLocalChanges) {
      resetToInitialState();
    } else {
      openCancelDialog();
    }
  };

  return (
    <>
      <ClerkEnrollmentAppointmentDetailsFields
        showFieldErrorBeforeChange={false}
        enrollment={enrollmentDetails}
        examEvents={examEvents}
        newExamEvent={newExamEvent}
        onExamEventChange={handleExamEventChange}
        onTextFieldChange={handleTextFieldChange}
        onCheckboxFieldChange={handleCheckboxFieldChange}
        editDisabled={isViewMode}
        isViewMode={isViewMode}
        oid={oid}
        topControlButtons={
          <ControlButtons
            onCancel={handleCancelButtonClick}
            onEdit={handleEditButtonClick}
            onSave={handleSaveButtonClick}
            isViewMode={isViewMode}
            hasRequiredDetails={hasRequiredDetails}
            isLoading={isLoading}
          />
        }
      />
      <div className="columns flex-end margin-top-xxl">
        <CustomButton
          data-testid="clerk-enrollment-details__cancel-enrollment-button"
          variant={Variant.Contained}
          color={Color.Error}
          onClick={handleCancelEnrollmentButtonClick}
          disabled={
            enrollmentDetails.status === EnrollmentAppointmentStatus.CANCELED
          }
        >
          {t('cancelEnrollment')}
        </CustomButton>
      </div>
    </>
  );
};
