import { Grid, Paper } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
  CustomButton,
  CustomTextField,
  H1,
  H2,
  HeaderSeparator,
  Text,
} from 'shared/components';
import { Color, TextFieldTypes, Variant } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { PublicRegistrationControlButtons } from 'components/registration/PublicRegistrationControlButtons';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicRegistrationStepper } from 'components/registration/PublicRegistrationStepper';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicSuomiFiRegistration } from 'interfaces/publicRegistration';
import {
  increaseActiveStep,
  setIsEmailRegistration,
} from 'redux/reducers/examSession';
import { examSessionSelector } from 'redux/selectors/examSession';

export const PublicIdentificationGrid = () => {
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
  });
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });
  const translateCommon = useCommonTranslation();

  const navigate = useNavigate();

  const { activeStep, examSession } = useAppSelector(examSessionSelector);
  const dispatch = useAppDispatch();

  const handleErrors =
    (fieldName: keyof Pick<PublicSuomiFiRegistration, 'email'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { type, value, required } = event.target;

      const error = InputFieldUtils.inspectCustomTextFieldErrors(
        type as TextFieldTypes,
        value,
        required
      );

      const fieldErrorMessage = error ? translateCommon(error) : '';

      setFieldErrors({
        ...fieldErrors,
        [fieldName]: fieldErrorMessage,
      });
    };

  const handleChange =
    (fieldName: keyof Pick<PublicSuomiFiRegistration, 'email'>) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (fieldErrors[fieldName]) {
        handleErrors(fieldName)(event);
      }

      setEmail(event.target.value);
    };

  const showCustomTextFieldError = (
    fieldName: keyof Pick<PublicSuomiFiRegistration, 'email'>
  ) => {
    return fieldErrors[fieldName].length > 0;
  };

  if (!examSession) {
    return null;
  }

  const renderDesktopView = () => (
    <>
      <Grid className="public-registration" item>
        <div className="public-registration__grid">
          <div className="rows gapped-xxl">
            <PublicRegistrationStepper activeStep={activeStep} />
            <div className="rows">
              <H1>{t('header')}</H1>
              <HeaderSeparator />
            </div>
          </div>
          <Paper elevation={3}>
            <div className="public-registration__grid__form-container">
              <div className="rows gapped">
                <PublicRegistrationExamSessionDetails
                  examSession={examSession}
                  showOpenings={true}
                />
                <Text>
                  {t('steps.identify.instructionDescription')}
                  <ul>
                    <li>
                      <Text>{t('steps.identify.instructions.location')}</Text>
                    </li>
                    <li>
                      <Text>{t('steps.identify.instructions.time')}</Text>
                    </li>
                  </ul>
                </Text>

                <div className="gapped rows">
                  <H2>{t('steps.identify.title')}</H2>
                  <Text>
                    <Trans t={t} i18nKey={'steps.identify.withFinnishSSN'} />
                  </Text>
                  <CustomButton
                    className="public-registration__grid__form-container__registration-button"
                    size="large"
                    variant={Variant.Contained}
                    color={Color.Secondary}
                    onClick={() => {
                      // TODO: init authentication for suomi.fi
                      dispatch(increaseActiveStep());
                      navigate(
                        AppRoutes.ExamSessionRegistration.replace(
                          /:examSessionId$/,
                          `${examSession.id}`
                        )
                      );
                    }}
                    data-testid="public-registration__identify-button"
                    disabled={false}
                  >
                    {t('steps.identify.suomiFiButtonText')}
                  </CustomButton>
                  <Text>
                    <Trans t={t} i18nKey={'steps.identify.withoutFinnishSSN'} />
                  </Text>
                  <div className="columns gapped align-items-start">
                    <CustomTextField
                      className="public-registration__grid__form-container__registration-text-field"
                      error={showCustomTextFieldError('email')}
                      placeholder={t('steps.identify.emailPlacehodler')}
                      variant={Variant.Outlined}
                      type={TextFieldTypes.Email}
                      value={email}
                      onChange={handleChange('email')}
                      onBlur={handleErrors('email')}
                      helperText={fieldErrors['email']}
                    ></CustomTextField>
                    <CustomButton
                      size="large"
                      className="public-registration__grid__form-container__registration-button"
                      variant={Variant.Contained}
                      color={Color.Secondary}
                      onClick={() => {
                        dispatch(setIsEmailRegistration(true));
                        dispatch(increaseActiveStep());
                        navigate(
                          AppRoutes.ExamSessionRegistration.replace(
                            /:examSessionId$/,
                            `${examSession.id}`
                          )
                        );
                      }}
                      data-testid="public-registration__identify-button"
                      disabled={false}
                    >
                      {t('steps.identify.emailButtonText')}
                    </CustomButton>
                  </div>
                  <div className="columns margin-top-lg justify-content-center">
                    <PublicRegistrationControlButtons
                      activeStep={activeStep}
                      isLoading={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Paper>
        </div>
      </Grid>
    </>
  );

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-registration"
    >
      {renderDesktopView()}
    </Grid>
  );
};
