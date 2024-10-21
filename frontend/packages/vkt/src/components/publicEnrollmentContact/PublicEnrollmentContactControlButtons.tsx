import {
  ArrowBackOutlined as ArrowBackIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import { loadPublicEnrollmentSave } from 'redux/reducers/publicEnrollmentContact';
import { RouteUtils } from 'utils/routes';

export const PublicEnrollmentContactControlButtons = ({
  activeStep,
  enrollment,
  isStepValid,
  setShowValidation,
  submitStatus,
  examinerId,
}: {
  activeStep: PublicEnrollmentContactFormStep;
  enrollment: PublicEnrollmentContact;
  isStepValid: boolean;
  setShowValidation: (showValidation: boolean) => void;
  submitStatus: APIResponseStatus;
  examinerId: number;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.controlButtons',
  });
  const translateCommon = useCommonTranslation();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleCancelBtnClick = () => {
    // FIXME
  };

  useEffect(() => {
    if (submitStatus === APIResponseStatus.Success) {
      navigate(AppRoutes.PublicGoodAndSatisfactoryLevelLanding);
    }
  }, [submitStatus, navigate]);

  const handleBackBtnClick = () => {
    const nextStep: PublicEnrollmentContactFormStep = activeStep - 1;
    navigate(RouteUtils.contactStepToRoute(nextStep, examinerId));
  };

  const handleNextBtnClick = () => {
    if (isStepValid) {
      setShowValidation(false);
      const nextStep: PublicEnrollmentContactFormStep = activeStep + 1;
      navigate(RouteUtils.contactStepToRoute(nextStep, examinerId));
    } else {
      setShowValidation(true);
    }
  };

  const handleSubmitBtnClick = () => {
    if (isStepValid) {
      setIsSubmitLoading(true);
      setShowValidation(false);
      dispatch(loadPublicEnrollmentSave({ enrollment, examinerId }));
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
        disabled={isSubmitLoading}
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
        activeStep == PublicEnrollmentContactFormStep.FillContactDetails ||
        isSubmitLoading
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
      disabled={isSubmitLoading}
    >
      {translateCommon('next')}
    </CustomButton>
  );

  const SubmitButton = () => (
    <LoadingProgressIndicator
      translateCommon={translateCommon}
      isLoading={false}
    >
      <CustomButton
        variant={Variant.Contained}
        color={Color.Secondary}
        onClick={handleSubmitBtnClick}
        data-testid="public-enrollment__controlButtons__submit"
        disabled={isSubmitLoading}
      >
        {t('submit')}
      </CustomButton>
    </LoadingProgressIndicator>
  );

  const renderBack = true;
  const renderNext =
    activeStep === PublicEnrollmentContactFormStep.FillContactDetails;
  const renderSubmit =
    activeStep === PublicEnrollmentContactFormStep.SelectExam;

  return (
    <div className="columns flex-end gapped margin-top-lg">
      {CancelButton()}
      {renderBack && BackButton()}
      {renderNext && NextButton()}
      {renderSubmit && SubmitButton()}
    </div>
  );
};
