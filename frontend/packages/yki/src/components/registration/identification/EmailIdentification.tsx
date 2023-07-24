import { useCallback, useState } from 'react';
import { Trans } from 'react-i18next';
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

export const EmailIdentification = () => {
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
    [setError, translateCommon]
  );

  const onSubmit = useCallback(() => {
    const error = validateEmail(email);
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
  }, [
    dispatch,
    email,
    examSession.id,
    showDialog,
    t,
    translateCommon,
    validateEmail,
  ]);

  const { isPhone } = useWindowProperties();

  return (
    <>
      <Text>
        <Trans t={t} i18nKey={'withoutFinnishSSN.description'} />
        <br />
        {t('withoutFinnishSSN.info')}
      </Text>
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
    </>
  );
};
