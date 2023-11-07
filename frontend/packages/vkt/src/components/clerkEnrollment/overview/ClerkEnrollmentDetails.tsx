import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { CustomButton, CustomModal } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { StringUtils } from 'shared/utils';

import { ClerkEnrollmentDetailsFields } from 'components/clerkEnrollment/overview/ClerkEnrollmentDetailsFields';
import { ControlButtons } from 'components/clerkEnrollment/overview/ControlButtons';
import { MoveModal } from 'components/clerkEnrollment/overview/MoveModal';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { EnrollmentStatus, UIMode } from 'enums/app';
import { ClerkEnrollmentTextFieldEnum } from 'enums/clerkEnrollment';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import {
  resetClerkEnrollmentDetailsUpdate,
  updateClerkEnrollmentDetails,
} from 'redux/reducers/clerkEnrollmentDetails';
import {
  changeClerkEnrollmentStatus,
  resetClerkEnrollmentStatusChange,
} from 'redux/reducers/clerkExamEventOverview';
import { clerkEnrollmentDetailsSelector } from 'redux/selectors/clerkEnrollmentDetails';
import { clerkExamEventOverviewSelector } from 'redux/selectors/clerkExamEventOverview';
import { EnrollmentUtils } from 'utils/enrollment';

export const ClerkEnrollmentDetails = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { status, enrollment, paymentRefundStatus } = useAppSelector(
    clerkEnrollmentDetailsSelector,
  );
  const { examEvent, clerkEnrollmentChangeStatus } = useAppSelector(
    clerkExamEventOverviewSelector,
  );

  const { showToast } = useToast();
  const { showDialog } = useDialog();

  // Local state
  const [enrollmentDetails, setEnrollmentDetails] = useState<
    ClerkEnrollment | undefined
  >(enrollment);
  const [isMoveModalOpen, setIsOpenModalOpen] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const isViewMode = currentUIMode === UIMode.View;

  const handleMoveButtonCLick = () => setIsOpenModalOpen(true);
  const closeMoveModal = () => setIsOpenModalOpen(false);

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
    dispatch(resetClerkEnrollmentStatusChange());
    resetLocalEnrollmentDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [dispatch, resetLocalEnrollmentDetails]);

  useNavigationProtection(hasLocalChanges);

  useEffect(() => {
    if (
      (status === APIResponseStatus.Success && currentUIMode === UIMode.Edit) ||
      clerkEnrollmentChangeStatus === APIResponseStatus.Success ||
      paymentRefundStatus === APIResponseStatus.Success
    ) {
      const description =
        clerkEnrollmentChangeStatus === APIResponseStatus.Success
          ? t('toasts.enrollmentCanceled')
          : t('toasts.updated');

      showToast({
        severity: Severity.Success,
        description,
      });
      resetToInitialState();
    }
  }, [
    currentUIMode,
    showToast,
    resetToInitialState,
    t,
    status,
    clerkEnrollmentChangeStatus,
    paymentRefundStatus,
  ]);

  if (!enrollmentDetails || !examEvent) {
    return null;
  }

  const hasRequiredDetails =
    StringUtils.isNonBlankString(enrollmentDetails.email) &&
    StringUtils.isNonBlankString(enrollmentDetails.phoneNumber) &&
    EnrollmentUtils.isValidPartialExamsAndSkills(enrollmentDetails) &&
    EnrollmentUtils.isValidCertificateShipping(enrollmentDetails);

  const handleTextFieldChange =
    (field: ClerkEnrollmentTextFieldEnum) =>
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      handleFieldChange(field, event.target.value);
    };

  const handleCheckboxFieldChange = (
    field:
      | keyof PartialExamsAndSkills
      | keyof Pick<ClerkEnrollment, 'digitalCertificateConsent'>,
    fieldValue: boolean,
  ) => {
    handleFieldChange(field, fieldValue);
  };

  const handleFieldChange = (
    field:
      | ClerkEnrollmentTextFieldEnum
      | keyof PartialExamsAndSkills
      | keyof Pick<ClerkEnrollment, 'digitalCertificateConsent'>,
    fieldValue: string | boolean,
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

  const handleSaveButtonClick = () => {
    dispatch(
      updateClerkEnrollmentDetails({
        enrollment: enrollmentDetails,
        examEvent,
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
    const statusChange = {
      id: enrollmentDetails.id,
      version: enrollmentDetails.version,
      newStatus: EnrollmentStatus.CANCELED,
    };

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
            dispatch(changeClerkEnrollmentStatus({ statusChange, examEvent })),
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
      <CustomModal
        data-testid="clerk-enrollment-details__move-modal"
        open={isMoveModalOpen}
        onCloseModal={closeMoveModal}
        aria-labelledby="modal-title"
        modalTitle={t('moveModal.title')}
      >
        <MoveModal enrollment={enrollmentDetails} onCancel={closeMoveModal} />
      </CustomModal>
      <ClerkEnrollmentDetailsFields
        showFieldErrorBeforeChange={false}
        enrollment={enrollmentDetails}
        onTextFieldChange={handleTextFieldChange}
        onCheckboxFieldChange={handleCheckboxFieldChange}
        editDisabled={isViewMode}
        topControlButtons={
          <ControlButtons
            onCancel={handleCancelButtonClick}
            onEdit={handleEditButtonClick}
            onSave={handleSaveButtonClick}
            onMove={handleMoveButtonCLick}
            isViewMode={isViewMode}
            hasRequiredDetails={hasRequiredDetails}
          />
        }
      />
      <div className="columns flex-end margin-top-xxl">
        <CustomButton
          data-testid="clerk-enrollment-details__cancel-enrollment-button"
          variant={Variant.Contained}
          color={Color.Error}
          onClick={handleCancelEnrollmentButtonClick}
          disabled={enrollmentDetails.status === EnrollmentStatus.CANCELED}
        >
          {t('cancelEnrollment')}
        </CustomButton>
      </div>
    </>
  );
};
