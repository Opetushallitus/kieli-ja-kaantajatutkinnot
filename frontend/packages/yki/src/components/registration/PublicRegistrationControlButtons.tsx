import { useNavigate } from 'react-router';
import { CustomButton, Text } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { usePublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import {
  increaseActiveStep,
  resetPublicRegistration,
  setShowErrors,
} from 'redux/reducers/registration';
import { publicIdentificationSelector } from 'redux/selectors/publicIdentifaction';
import { registrationSelector } from 'redux/selectors/registration';

const AbortButton = () => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.controlButtons',
  });
  const { showDialog } = useDialog();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

  return (
    <>
      <CustomButton
        variant={Variant.Text}
        color={Color.Secondary}
        onClick={handleAbortBtnClick}
        data-testid="public-registration__controlButtons__abort"
      >
        {t('abortRegistration')}
      </CustomButton>
    </>
  );
};

const SubmitButton = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });
  const translateCommon = useCommonTranslation();
  const { activeStep } = useAppSelector(registrationSelector);
  const { showDialog } = useDialog();
  const dispatch = useAppDispatch();
  const getRegistrationErrors = usePublicRegistrationErrors(true);

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
        // TODO Instead submit registration order!
        dispatch(increaseActiveStep());
      }
    } else {
      dispatch(increaseActiveStep());
    }
  };

  return (
    <CustomButton
      className="margin-top-lg"
      size="large"
      sx={{ width: '30rem', padding: '15px 22px' }}
      variant={Variant.Contained}
      color={Color.Secondary}
      onClick={handleSubmitBtnClick}
      data-testid="public-registration__controlButtons__submit"
    >
      {t('controlButtons.confirm')}
    </CustomButton>
  );
};

export const PublicRegistrationControlButtons = () => {
  const emailLinkOrderStatus = useAppSelector(publicIdentificationSelector)
    .emailLinkOrder.status;
  const { activeStep } = useAppSelector(registrationSelector);

  const renderAbort =
    (activeStep === PublicRegistrationFormStep.Identify &&
      emailLinkOrderStatus !== APIResponseStatus.Success) ||
    activeStep === PublicRegistrationFormStep.Register;
  const renderSubmit = activeStep === PublicRegistrationFormStep.Register;

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
