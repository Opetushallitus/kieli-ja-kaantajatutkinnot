import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { CustomButton, LabeledTextField, Text } from 'shared/components';
import { Color, Severity, TextFieldTypes, Variant } from 'shared/enums';
import { useDebounce, useDialog } from 'shared/hooks';
import { InputFieldUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamSession } from 'interfaces/examSessions';
import { sendEmailLinkOrder } from 'redux/reducers/publicIdentification';
import { examSessionSelector } from 'redux/selectors/examSession';

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

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
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
      <div className="columns gapped align-items-end">
        <LabeledTextField
          id="email-identification__email-input"
          label={t('emailInput.label')}
          placeholder={t('emailInput.placeholder')}
          className="public-registration__grid__form-container__registration-text-field"
          error={showError && !!error}
          variant={Variant.Outlined}
          type={TextFieldTypes.Email}
          value={email}
          onChange={handleEmailChange}
          helperText={error}
        />
        <CustomButton
          className="public-registration__grid__form-container__registration-button"
          variant={Variant.Contained}
          color={Color.Secondary}
          onClick={onSubmit}
        >
          {t('emailButtonText')}
        </CustomButton>
      </div>
    </>
  );
};
