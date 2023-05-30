import {
  ArrowBackOutlined as ArrowBackIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from '@mui/icons-material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { AppRoutes, EnrollmentStatus } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import {
  PublicEnrollment,
  PublicReservationDetails,
} from 'interfaces/publicEnrollment';
import {
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  loadPublicEnrollmentSave,
  resetPublicEnrollment,
} from 'redux/reducers/publicEnrollment';
import { resetSelectedPublicExamEvent } from 'redux/reducers/publicExamEvent';
import { RouteUtils } from 'utils/routes';

export const PublicEnrollmentControlButtons = ({
  activeStep,
  enrollment,
  reservationDetails,
  isLoading,
  isStepValid,
  setShowValidation,
  submitStatus,
  isStepsAvailable,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
  reservationDetails: PublicReservationDetails;
  isLoading: boolean;
  isStepValid: boolean;
  setShowValidation: (showValidation: boolean) => void;
  submitStatus: APIResponseStatus;
  isStepsAvailable: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.controlButtons',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { showDialog } = useDialog();
  const reservationId = reservationDetails.reservation?.id;
  const examEventId = reservationDetails.examEvent.id;
  const enrollToQueue =
    !reservationDetails.reservation &&
    enrollment.status != EnrollmentStatus.EXPECTING_PAYMENT;

  const handleCancelBtnClick = () => {
    if (activeStep === PublicEnrollmentFormStep.Authenticate) {
      dispatch(cancelPublicEnrollment());
    } else {
      const confirmAction = reservationId
        ? cancelPublicEnrollmentAndRemoveReservation(reservationId)
        : cancelPublicEnrollment();

      showDialog({
        title: t('cancelDialog.title'),
        severity: Severity.Info,
        description: t('cancelDialog.description'),
        actions: [
          {
            title: translateCommon('back'),
            variant: Variant.Outlined,
          },
          {
            title: translateCommon('yes'),
            variant: Variant.Contained,
            action: () => {
              dispatch(confirmAction);
              dispatch(resetPublicEnrollment());
              dispatch(resetSelectedPublicExamEvent());

              if (!reservationId) {
                navigate(AppRoutes.PublicHomePage);
              }
            },
          },
        ],
      });
    }
  };

  useEffect(() => {
    if (submitStatus === APIResponseStatus.Success) {
      if (reservationDetails.reservation) {
        window.location.href = `${APIEndpoints.Payment}/create/${enrollment.id}/redirect`;
      } else {
        navigate(
          RouteUtils.stepToRoute(PublicEnrollmentFormStep.Done, examEventId)
        );
      }
    }
  }, [
    submitStatus,
    navigate,
    dispatch,
    examEventId,
    enrollment.id,
    reservationDetails.reservation,
  ]);

  const handleBackBtnClick = () => {
    const nextStep: PublicEnrollmentFormStep = activeStep - 1;
    navigate(RouteUtils.stepToRoute(nextStep, examEventId));
  };

  const handleNextBtnClick = () => {
    if (isStepValid) {
      setShowValidation(false);
      const nextStep: PublicEnrollmentFormStep = activeStep + 1;
      navigate(RouteUtils.stepToRoute(nextStep, examEventId));
    } else {
      setShowValidation(true);
    }
  };

  const handleSubmitBtnClick = () => {
    if (isStepValid) {
      setShowValidation(false);
      if (enrollment.status === EnrollmentStatus.EXPECTING_PAYMENT) {
        window.location.href = `${APIEndpoints.Payment}/create/${enrollment.id}/redirect`;
      } else {
        dispatch(
          loadPublicEnrollmentSave({
            enrollment,
            reservationDetails,
          })
        );
      }
    } else {
      setShowValidation(true);
    }
  };

  const CancelButton = () => (
    <>
      <CustomButton
        variant={Variant.Text}
        color={Color.Secondary}
        onClick={handleCancelBtnClick}
        data-testid="public-enrollment__controlButtons__cancel"
        disabled={isLoading}
      >
        {translateCommon('cancel')}
      </CustomButton>
    </>
  );

  const BackButton = () => (
    <CustomButton
      variant={Variant.Outlined}
      color={Color.Secondary}
      onClick={handleBackBtnClick}
      data-testid="public-enrollment__controlButtons__back"
      startIcon={<ArrowBackIcon />}
      disabled={
        activeStep == PublicEnrollmentFormStep.FillContactDetails || isLoading
      }
    >
      {translateCommon('back')}
    </CustomButton>
  );

  const NextButton = () => (
    <CustomButton
      variant={Variant.Contained}
      color={Color.Secondary}
      onClick={handleNextBtnClick}
      data-testid="public-enrollment__controlButtons__next"
      endIcon={<ArrowForwardIcon />}
      disabled={isLoading}
    >
      {translateCommon('next')}
    </CustomButton>
  );

  const SubmitButton = () => (
    <CustomButton
      variant={Variant.Contained}
      color={Color.Secondary}
      onClick={handleSubmitBtnClick}
      data-testid="public-enrollment__controlButtons__submit"
      endIcon={<ArrowForwardIcon />}
      disabled={isLoading}
    >
      {enrollToQueue ? t('sendForm') : t('pay')}
    </CustomButton>
  );

  const renderBack =
    activeStep !== PublicEnrollmentFormStep.Authenticate && isStepsAvailable;

  const renderNext =
    [
      PublicEnrollmentFormStep.FillContactDetails,
      PublicEnrollmentFormStep.SelectExam,
    ].includes(activeStep) && isStepsAvailable;

  const renderSubmit = activeStep === PublicEnrollmentFormStep.Preview;

  return (
    <div className="columns flex-end gapped margin-top-lg">
      {CancelButton()}
      {renderBack && BackButton()}
      {renderNext && NextButton()}
      {renderSubmit && SubmitButton()}
    </div>
  );
};
