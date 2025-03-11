import {
  ArrowBackOutlined as ArrowBackIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CustomButton,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';
import { getErrors } from 'shared/utils';

import { certificateShippingFields } from 'components/publicEnrollmentAppointment/steps/CertificateShipping';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentAppointmentFormStep } from 'enums/publicEnrollment';
import { CertificateShippingTextFields } from 'interfaces/common/enrollment';
import { PublicEnrollmentAppointment } from 'interfaces/publicEnrollment';
import {
  loadPublicEnrollmentSave,
  resetPublicEnrollmentAppointment,
  setLoadingPayment,
} from 'redux/reducers/publicEnrollmentAppointment';
import { RouteUtils } from 'utils/routes';

export const PublicEnrollmentAppointmentControlButtons = ({
  activeStep,
  enrollment,
  isStepValid,
  setShowValidation,
  submitStatus,
}: {
  activeStep: PublicEnrollmentAppointmentFormStep;
  enrollment: PublicEnrollmentAppointment;
  isStepValid: boolean;
  setShowValidation: (showValidation: boolean) => void;
  submitStatus: APIResponseStatus;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentAppointment.controlButtons',
  });
  const translateCommon = useCommonTranslation();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { showDialog } = useDialog();

  const handleCancelBtnClick = () => {
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
            dispatch(resetPublicEnrollmentAppointment());
            navigate(AppRoutes.PublicGoodAndSatisfactoryLevelLanding);
          },
        },
      ],
    });
  };

  useEffect(() => {
    if (submitStatus === APIResponseStatus.Success) {
      // Safari needs time to re-render loading indicator
      setTimeout(() => {
        window.location.href = RouteUtils.getPaymentCreateApiRoute(
          'appointment',
          enrollment.id,
        );
      }, 200);
      dispatch(setLoadingPayment());
    }
  }, [submitStatus, enrollment.id, dispatch]);

  const handleBackBtnClick = () => {
    const nextStep: PublicEnrollmentAppointmentFormStep = activeStep - 1;
    navigate(RouteUtils.appointmentStepToRoute(nextStep, enrollment.id));
  };

  const handleNextBtnClick = () => {
    if (isStepValid) {
      setShowValidation(false);
      const nextStep: PublicEnrollmentAppointmentFormStep = activeStep + 1;
      navigate(RouteUtils.appointmentStepToRoute(nextStep, enrollment.id));
    } else {
      const errors = getErrors<CertificateShippingTextFields>({
        fields: certificateShippingFields,
        values: enrollment,
        t,
      });

      const dialogContent = (
        <div>
          <Text>{t('errors.fixErrors')}</Text>
          <ul>
            {Object.entries(errors)
              .filter(([_, val]) => val)
              .map(([field, _]) => (
                <Text key={field}>
                  <li>{t(`errors.fields.${field}`)}</li>
                </Text>
              ))}
          </ul>
        </div>
      );

      showDialog({
        title: t('errors.title'),
        severity: Severity.Error,
        content: dialogContent,
        actions: [
          { title: translateCommon('back'), variant: Variant.Contained },
        ],
      });
      setShowValidation(true);
    }
  };

  const handleSubmitBtnClick = () => {
    if (isStepValid) {
      setIsPaymentLoading(true);
      setShowValidation(false);
      dispatch(loadPublicEnrollmentSave(enrollment));
    } else {
      const errors = {
        privacyStatementConfirmation: !enrollment.privacyStatementConfirmation,
      };

      const dialogContent = (
        <div>
          <Text>{t('errors.fixErrors')}</Text>
          <ul>
            {Object.entries(errors)
              .filter(([_, val]) => val)
              .map(([field, _]) => (
                <Text key={field}>
                  <li>{t(`errors.fields.${field}`)}</li>
                </Text>
              ))}
          </ul>
        </div>
      );

      showDialog({
        title: t('errors.title'),
        severity: Severity.Error,
        content: dialogContent,
        actions: [
          { title: translateCommon('back'), variant: Variant.Contained },
        ],
      });
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
        activeStep == PublicEnrollmentAppointmentFormStep.FillContactDetails ||
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
      isLoading={false}
    >
      <CustomButton
        variant={Variant.Contained}
        color={Color.Secondary}
        onClick={handleSubmitBtnClick}
        data-testid="public-enrollment__controlButtons__submit"
        disabled={isPaymentLoading}
      >
        {t('pay')}
      </CustomButton>
    </LoadingProgressIndicator>
  );

  const renderBack = true;
  const renderNext =
    activeStep === PublicEnrollmentAppointmentFormStep.FillContactDetails;
  const renderSubmit =
    activeStep === PublicEnrollmentAppointmentFormStep.Preview;

  return (
    <div className="columns flex-end gapped margin-top-lg">
      {CancelButton()}
      {renderBack && BackButton()}
      {renderNext && NextButton()}
      {renderSubmit && SubmitButton()}
    </div>
  );
};
