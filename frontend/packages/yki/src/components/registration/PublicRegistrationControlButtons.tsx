import {
  ArrowBackOutlined as ArrowBackIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { CustomButton } from 'shared/components';
import { Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import {
  decreaseActiveStep,
  increaseActiveStep,
  resetPublicRegistration,
} from 'redux/reducers/examSession';

export const PublicRegistrationControlButtons = ({
  activeStep,
  isLoading,
  disableNext,
}: {
  activeStep: PublicRegistrationFormStep;
  isLoading: boolean;
  disableNext: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.controlButtons',
  });
  const translateCommon = useCommonTranslation();

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
            dispatch(resetPublicRegistration());
            navigate(AppRoutes.Registration);
          },
        },
      ],
    });
  };

  const handleBackBtnClick = () => {
    dispatch(decreaseActiveStep());
  };

  const handleSubmitBtnClick = () => {
    dispatch(increaseActiveStep());
  };

  const CancelButton = () => (
    <>
      <CustomButton
        variant={Variant.Text}
        color={Color.Secondary}
        onClick={handleCancelBtnClick}
        data-testid="public-registration__controlButtons__cancel"
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
      data-testid="public-registration__controlButtons__back"
      startIcon={<ArrowBackIcon />}
      disabled={activeStep == PublicRegistrationFormStep.Register || isLoading}
    >
      {translateCommon('back')}
    </CustomButton>
  );

  const SubmitButton = () => (
    <CustomButton
      variant={Variant.Contained}
      color={Color.Secondary}
      onClick={handleSubmitBtnClick}
      data-testid="public-registration__controlButtons__submit"
      endIcon={<ArrowForwardIcon />}
      disabled={disableNext || isLoading}
    >
      {t('pay')}
    </CustomButton>
  );

  const renderBack = activeStep !== PublicRegistrationFormStep.Identify;

  const renderSubmit = activeStep === PublicRegistrationFormStep.Register;

  return (
    <div className="columns flex-end gapped margin-top-lg">
      {CancelButton()}
      {renderBack && BackButton()}
      {renderSubmit && SubmitButton()}
    </div>
  );
};
