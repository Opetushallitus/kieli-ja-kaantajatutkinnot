import {
  ArrowBackOutlined as ArrowBackIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import {
  PublicEnrollment,
  PublicReservation,
} from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import {
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  loadPublicEnrollmentSave,
} from 'redux/reducers/publicEnrollment';
import { RouteUtils } from 'utils/routes';

export const PublicEnrollmentControlButtons = ({
  activeStep,
  examEvent,
  enrollment,
  reservation,
  isLoading,
  isStepValid,
  setShowValidation,
  submitStatus,
  isPaymentLinkPreviewView,
}: {
  activeStep: PublicEnrollmentFormStep;
  examEvent: PublicExamEvent;
  enrollment: PublicEnrollment;
  reservation?: PublicReservation;
  isLoading: boolean;
  isStepValid: boolean;
  setShowValidation: (showValidation: boolean) => void;
  submitStatus: APIResponseStatus;
  isPaymentLinkPreviewView: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.controlButtons',
  });
  const translateCommon = useCommonTranslation();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { showDialog } = useDialog();
  const reservationId = reservation?.id;
  const examEventId = examEvent.id;
  const isEnrollmentToQueue = !reservation && !isPaymentLinkPreviewView;

  const handleCancelBtnClick = () => {
    if (isPaymentLinkPreviewView) {
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
            },
          },
        ],
      });
    }
  };

  useEffect(() => {
    if (submitStatus === APIResponseStatus.Success) {
      if (reservation) {
        // Safari needs time to re-render loading indicator
        setTimeout(() => {
          window.location.href = `${APIEndpoints.Payment}/create/${enrollment.id}/redirect`;
        }, 200);
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
    reservation,
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
      setIsPaymentLoading(true);
      setShowValidation(false);
      if (isPaymentLinkPreviewView) {
        // Safari needs time to re-render loading indicator
        setTimeout(() => {
          window.location.href = `${APIEndpoints.Payment}/create/${enrollment.id}/redirect`;
        }, 200);
      } else {
        dispatch(
          loadPublicEnrollmentSave({
            enrollment,
            examEventId,
            reservationId,
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
        disabled={isLoading || isPaymentLoading}
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
        activeStep == PublicEnrollmentFormStep.FillContactDetails ||
        isLoading ||
        isPaymentLoading
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
      disabled={isLoading || isPaymentLoading}
    >
      {translateCommon('next')}
    </CustomButton>
  );

  const SubmitButton = () => (
    <LoadingProgressIndicator
      translateCommon={translateCommon}
      isLoading={isPaymentLoading}
    >
      <CustomButton
        variant={Variant.Contained}
        color={Color.Secondary}
        onClick={handleSubmitBtnClick}
        data-testid="public-enrollment__controlButtons__submit"
        disabled={isLoading || isPaymentLoading}
      >
        {isEnrollmentToQueue ? t('enrollToQueue') : t('pay')}
      </CustomButton>
    </LoadingProgressIndicator>
  );

  const renderBack = !isPaymentLinkPreviewView;

  const renderNext = [
    PublicEnrollmentFormStep.FillContactDetails,
    PublicEnrollmentFormStep.SelectExam,
  ].includes(activeStep);

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
