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
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { RouteUtils } from 'utils/routes';

export const PublicEnrollmentAppointmentControlButtons = ({
  activeStep,
  enrollment,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollmentAppointment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.controlButtons',
  });
  const translateCommon = useCommonTranslation();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // FIXME
  const submitStatus = APIResponseStatus.NotStarted;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { showDialog } = useDialog();

  const submitButtonText = () => {
    return t('pay');
  };

  const handleCancelBtnClick = () => {
    // FIXME
  };

  useEffect(() => {
    if (submitStatus === APIResponseStatus.Success) {
      // Safari needs time to re-render loading indicator
      setTimeout(() => {
        window.location.href = RouteUtils.getPaymentCreateApiRoute(
          enrollment.id,
        );
      }, 200);
      dispatch(setLoadingPayment());
    }
  }, [submitStatus, enrollment.id, dispatch]);

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
      dispatch(
        loadPublicEnrollmentUpdate({
          enrollment,
          examEventId,
        }),
      );
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
        disabled={isPaymentLoading}
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
      disabled={isPaymentLoading}
    >
      {translateCommon('next')}
    </CustomButton>
  );

  const SubmitButton = () => (
    <LoadingProgressIndicator
      translateCommon={translateCommon}
      isLoading={isEnrollmentSubmitLoading || isPaymentLoading}
    >
      <CustomButton
        variant={Variant.Contained}
        color={Color.Secondary}
        onClick={handleSubmitBtnClick}
        data-testid="public-enrollment__controlButtons__submit"
        disabled={isPaymentLoading}
      >
        {submitButtonText()}
      </CustomButton>
    </LoadingProgressIndicator>
  );

  const renderBack = true;

  const renderNext = [
    PublicEnrollmentFormStep.FillContactDetails,
    PublicEnrollmentFormStep.EducationDetails,
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
