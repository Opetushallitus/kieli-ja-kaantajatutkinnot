import { useNavigate } from 'react-router';
import { CustomButton } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { increaseActiveStep } from 'redux/reducers/examSession';
import { resetPublicRegistration } from 'redux/reducers/registration';
import { publicIdentificationSelector } from 'redux/selectors/publicIdentifaction';

export const PublicRegistrationControlButtons = ({
  activeStep,
  isLoading,
}: {
  activeStep: PublicRegistrationFormStep;
  isLoading: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.controlButtons',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const emailLinkOrderStatus = useAppSelector(publicIdentificationSelector)
    .emailLinkOrder.status;
  const navigate = useNavigate();

  const { showDialog } = useDialog();

  const handleAbortBtnClick = () => {
    showDialog({
      title: t('abortDialog.title'),
      severity: Severity.Info,
      description: t('abortDialog.description'),
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

  const handleSubmitBtnClick = () => {
    dispatch(increaseActiveStep());
  };

  const AbortButton = () => (
    <>
      <CustomButton
        variant={Variant.Text}
        color={Color.Secondary}
        onClick={handleAbortBtnClick}
        data-testid="public-registration__controlButtons__abort"
        disabled={isLoading}
      >
        {t('abortRegistration')}
      </CustomButton>
    </>
  );

  const SubmitButton = () => (
    <CustomButton
      className="margin-top-lg"
      size="large"
      sx={{ width: '30rem', padding: '15px 22px' }}
      variant={Variant.Contained}
      color={Color.Secondary}
      onClick={handleSubmitBtnClick}
      data-testid="public-registration__controlButtons__submit"
      disabled={isLoading}
    >
      {t('confirm')}
    </CustomButton>
  );

  const renderAbort =
    (activeStep === PublicRegistrationFormStep.Identify &&
      emailLinkOrderStatus !== APIResponseStatus.Success) ||
    activeStep === PublicRegistrationFormStep.Register;
  const renderSubmit = activeStep === PublicRegistrationFormStep.Register;

  if (renderAbort || renderSubmit) {
    return (
      <div className="columns margin-top-lg justify-content-center">
        <div className="rows flex-end gapped margin-top-lg align-items-center">
          {renderSubmit && SubmitButton()}
          {renderAbort && AbortButton()}
        </div>
      </div>
    );
  } else {
    return null;
  }
};
