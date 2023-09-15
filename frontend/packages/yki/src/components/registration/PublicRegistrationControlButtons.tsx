import {
  CustomButton,
  CustomButtonLink,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { usePublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import {
  increaseActiveStep,
  setShowErrors,
  submitPublicRegistration,
} from 'redux/reducers/registration';
import { publicIdentificationSelector } from 'redux/selectors/publicIdentifaction';
import { registrationSelector } from 'redux/selectors/registration';

const AbortButton = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.controlButtons',
  });

  return (
    <>
      <CustomButtonLink
        variant={Variant.Text}
        color={Color.Secondary}
        to={AppRoutes.Registration}
        data-testid="public-registration__controlButtons__abort"
      >
        {t('abortRegistration')}
      </CustomButtonLink>
    </>
  );
};

const SubmitButton = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });
  const translateCommon = useCommonTranslation();
  const {
    activeStep,
    submitRegistration: { status: submitRegistrationStatus },
  } = useAppSelector(registrationSelector);
  const { showDialog } = useDialog();
  const dispatch = useAppDispatch();
  const getRegistrationErrors = usePublicRegistrationErrors(true);

  const isSubmitInProgress =
    submitRegistrationStatus === APIResponseStatus.InProgress;
  const handleSubmitBtnClick = () => {
    if (activeStep === PublicRegistrationFormStep.Register) {
      dispatch(setShowErrors(true));
      const registrationErrors = getRegistrationErrors();
      if (Object.values(registrationErrors).some((v) => v)) {
        const dialogContent = (
          <div>
            <Text>{t('registrationDetails.errors.fixErrors')}</Text>
            <ul>
              {Object.entries(registrationErrors)
                .filter(([_, val]) => val)
                .map(([field, _]) => (
                  <li key={field}>
                    <Text>
                      {t(`registrationDetails.errors.fields.${field}`)}
                    </Text>
                  </li>
                ))}
            </ul>
          </div>
        );
        showDialog({
          title: t('registrationDetails.errors.title'),
          severity: Severity.Error,
          content: dialogContent,
          actions: [
            { title: translateCommon('back'), variant: Variant.Contained },
          ],
        });
      } else {
        dispatch(submitPublicRegistration());
      }
    } else {
      dispatch(increaseActiveStep());
    }
  };

  return (
    <LoadingProgressIndicator
      translateCommon={translateCommon}
      isLoading={isSubmitInProgress}
    >
      <CustomButton
        className="margin-top-lg"
        disabled={isSubmitInProgress}
        size="large"
        sx={{ width: '30rem', padding: '15px 22px' }}
        variant={Variant.Contained}
        color={Color.Secondary}
        onClick={handleSubmitBtnClick}
        data-testid="public-registration__controlButtons__submit"
      >
        {t('controlButtons.confirm')}
      </CustomButton>
    </LoadingProgressIndicator>
  );
};

export const PublicRegistrationControlButtons = () => {
  const emailLinkOrderStatus = useAppSelector(publicIdentificationSelector)
    .emailLinkOrder.status;
  const {
    activeStep,
    submitRegistration: { status: submitRegistrationStatus },
  } = useAppSelector(registrationSelector);

  const renderAbort =
    (activeStep === PublicRegistrationFormStep.Identify &&
      emailLinkOrderStatus !== APIResponseStatus.Success) ||
    (activeStep === PublicRegistrationFormStep.Register &&
      submitRegistrationStatus !== APIResponseStatus.Success);
  const renderSubmit =
    activeStep === PublicRegistrationFormStep.Register &&
    submitRegistrationStatus !== APIResponseStatus.Success;

  if (renderAbort || renderSubmit) {
    return (
      <div className="columns margin-top-lg justify-content-center">
        <div className="rows flex-end gapped margin-top-lg align-items-center">
          {renderSubmit && <SubmitButton />}
          {renderAbort && <AbortButton />}
        </div>
      </div>
    );
  } else {
    return null;
  }
};
