import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import { Container } from '@mui/material';
import { useCallback, useState } from 'react';
import { CustomButton, LabeledTextField, Text } from 'shared/components';
import {
  Color,
  InputAutoComplete,
  Severity,
  TextFieldTypes,
  Variant,
} from 'shared/enums';
import { useDialog, useWindowProperties } from 'shared/hooks';
import { InputFieldUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamSession } from 'interfaces/examSessions';
import { sendEmailLinkOrder } from 'redux/reducers/publicIdentification';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';
import { ExamSessionUtils } from 'utils/examSession';

const EmailInput = ({
  email,
  error,
  setEmail,
  validateEmail,
}: {
  email: string;
  error: string;
  setEmail: (email: string) => void;
  validateEmail: (error: string) => void;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify.emailInput',
  });
  const { isPhone } = useWindowProperties();

  const handleBlur = useCallback(() => {
    validateEmail(email);
  }, [email, validateEmail]);

  return (
    <LabeledTextField
      id="email-identification__email-input"
      label={t('label')}
      placeholder={t('placeholder')}
      className="public-registration__grid__form-container__registration-text-field"
      error={!!error}
      variant={Variant.Outlined}
      type={TextFieldTypes.Email}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      onBlur={handleBlur}
      helperText={error}
      autoComplete={InputAutoComplete.Email}
      fullWidth={isPhone}
    />
  );
};

const SubmitButton = ({ onSubmit }: { onSubmit: () => void }) => {
  const { isPhone } = useWindowProperties();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });

  return (
    <CustomButton
      className="public-registration__grid__form-container__registration-button"
      variant={Variant.Contained}
      color={Color.Secondary}
      onClick={onSubmit}
      fullWidth={isPhone}
    >
      {t('emailButtonText')}
    </CustomButton>
  );
};

const ExamFeeRequiredInfo = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify.withoutFinnishSSN',
  });

  return (
    <Container className="public-registration__info-box columns gapped-sm">
      <InfoOutlineIcon color={Color.Secondary} />
      <Text>{t('examFeeRequired')}</Text>
    </Container>
  );
};

export const EmailIdentification = () => {
  const dispatch = useAppDispatch();
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const isFreeRegistrationPossible =
    ExamSessionUtils.freeRegistrationPossible(examSession);
  const { initRegistration } = useAppSelector(registrationSelector);

  const { showDialog } = useDialog();
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });

  const [showInput, setShowInput] = useState(false);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = useCallback(
    (email: string) => {
      const error = InputFieldUtils.validateCustomTextFieldErrors({
        type: TextFieldTypes.Email,
        value: email,
        required: true,
      });

      const fieldErrorMessage = error ? translateCommon(error) : '';

      setError(fieldErrorMessage);

      return error;
    },
    [setError, translateCommon],
  );

  const onSubmit = useCallback(() => {
    const error = validateEmail(email);
    if (!error) {
      dispatch(
        sendEmailLinkOrder({
          examSessionId: examSession.id,
          email,
          registrationKind: examSession.available_registration_kind,
          registrationId: initRegistration.registrationId,
        }),
      );
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
  }, [
    dispatch,
    email,
    examSession.id,
    examSession.available_registration_kind,
    initRegistration.registrationId,
    showDialog,
    t,
    translateCommon,
    validateEmail,
  ]);

  const { isPhone } = useWindowProperties();

  const toggleEmailInputBtnId =
    'public-registration--email-link-order__reveal-btn';
  const emailInputRegionId =
    'public-registration--email-link-order__input-region';

  return (
    <>
      <div className="columns">
        {showInput ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        <button
          className="public-registration--email-link-order__reveal-btn"
          onClick={() => setShowInput(!showInput)}
          aria-expanded={showInput}
          aria-controls={emailInputRegionId}
          id={toggleEmailInputBtnId}
        >
          <Text>{t('withoutFinnishSSN.description')}</Text>
        </button>
      </div>
      <div
        hidden={!showInput}
        role="region"
        id={emailInputRegionId}
        aria-labelledby={toggleEmailInputBtnId}
      >
        <Text>{t('withoutFinnishSSN.info')}</Text>
        {isFreeRegistrationPossible && <ExamFeeRequiredInfo />}
        {isPhone ? (
          <>
            <EmailInput
              email={email}
              error={error}
              setEmail={setEmail}
              validateEmail={validateEmail}
            />
            <SubmitButton onSubmit={onSubmit} />
          </>
        ) : (
          <div className="columns gapped align-items-end">
            <EmailInput
              email={email}
              error={error}
              setEmail={setEmail}
              validateEmail={validateEmail}
            />
            <div className="rows">
              <SubmitButton onSubmit={onSubmit} />
              {error && <Text>&nbsp;</Text>}
            </div>{' '}
          </div>
        )}
      </div>
    </>
  );
};
