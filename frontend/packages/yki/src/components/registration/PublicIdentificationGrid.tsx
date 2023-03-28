import DoneIcon from '@mui/icons-material/Done';
import { Grid, Paper } from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
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
import {
  APIResponseStatus,
  Color,
  Severity,
  TextFieldTypes,
  Variant,
} from 'shared/enums';
import { useDebounce, useDialog } from 'shared/hooks';
import { InputFieldUtils } from 'shared/utils';

import { PublicRegistrationControlButtons } from 'components/registration/PublicRegistrationControlButtons';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicRegistrationStepper } from 'components/registration/PublicRegistrationStepper';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import { increaseActiveStep } from 'redux/reducers/examSession';
import { sendEmailLinkOrder } from 'redux/reducers/publicIdentification';
import { examSessionSelector } from 'redux/selectors/examSession';
import { publicIdentificationSelector } from 'redux/selectors/publicIdentifaction';

const IdentificationWithFinnishSSN = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });

  return (
    <>
      <Text>
        <Trans t={t} i18nKey={'withFinnishSSN'} />
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
        {t('suomiFiButtonText')}
      </CustomButton>
    </>
  );
};

const IdentificationWithoutFinnishSSN = () => {
  const dispatch = useAppDispatch();
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;

  const { showDialog } = useDialog();
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const debounce = useDebounce(300);

  const validateEmail = useCallback(
    (email: string) => {
      const error = InputFieldUtils.validateCustomTextFieldErrors({
        type: TextFieldTypes.Email,
        value: email,
        required: true,
      });

      const fieldErrorMessage = error ? translateCommon(error) : '';

      setError(fieldErrorMessage);
    },
    [translateCommon]
  );

  useEffect(() => {
    debounce(() => validateEmail(email));
  }, [debounce, email, validateEmail]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const onSubmit = () => {
    validateEmail(email);
    setShowError(true);
    if (!error) {
      dispatch(sendEmailLinkOrder({ examSessionId: examSession.id, email }));
    } else {
      showDialog({
        title: t('emailLink.incorrectEmailDialog.title'),
        description: t('emailLink.incorrectEmailDialog.description'),
        severity: Severity.Error,
        actions: [
          { title: translateCommon('back'), variant: Variant.Contained },
        ],
      });
    }
  };

  return (
    <>
      <Text>
        <Trans t={t} i18nKey={'withoutFinnishSSN'} />
      </Text>
      <div className="columns gapped align-items-start">
        <CustomTextField
          className="public-registration__grid__form-container__registration-text-field"
          error={showError && !!error}
          placeholder={t('emailPlaceholder')}
          variant={Variant.Outlined}
          type={TextFieldTypes.Email}
          value={email}
          onChange={handleChange}
          helperText={error}
        ></CustomTextField>
        <CustomButton
          size="large"
          className="public-registration__grid__form-container__registration-button"
          variant={Variant.Contained}
          color={Color.Secondary}
          onClick={onSubmit}
          data-testid="public-registration__identify-button"
          disabled={false}
        >
          {t('emailButtonText')}
        </CustomButton>
      </div>
    </>
  );
};

const IdentificationSelection = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });
  const { emailLinkOrder } = useAppSelector(publicIdentificationSelector);

  if (emailLinkOrder.status === APIResponseStatus.Success) {
    return (
      <div className="columns gapped public-registration--email-link-order__success">
        <DoneIcon fontSize="large" />
        <Text>
          {t('emailLink.success')} <strong>{emailLinkOrder.email}</strong>
        </Text>
      </div>
    );
  } else {
    return (
      <>
        <H2>{t('title')}</H2>
        <IdentificationWithFinnishSSN />
        <IdentificationWithoutFinnishSSN />
      </>
    );
  }
};

export const PublicIdentificationGrid = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });

  const { activeStep, examSession } = useAppSelector(examSessionSelector);

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
                <Text>{t('steps.identify.instructionDescription')}</Text>
                <ul>
                  <Text>
                    <li>{t('steps.identify.instructions.location')}</li>
                  </Text>
                  <Text>
                    <li>{t('steps.identify.instructions.time')}</li>
                  </Text>
                </ul>
                <div className="gapped rows">
                  <IdentificationSelection />
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
