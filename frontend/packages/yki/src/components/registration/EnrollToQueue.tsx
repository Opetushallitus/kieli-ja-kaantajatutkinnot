import { useCallback, useEffect, useState } from 'react';
import { CustomButton, H2, LabeledTextField, Text } from 'shared/components';
import {
  APIResponseStatus,
  Color,
  CustomTextFieldErrors,
  InputAutoComplete,
  Severity,
  TextFieldTypes,
  Variant,
} from 'shared/enums';
import { useDialog } from 'shared/hooks';
import { InputFieldUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { YkiValidationErrors } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import {
  resetReservationRequest,
  sendReservationRequest,
} from 'redux/reducers/reservation';
import { examSessionSelector } from 'redux/selectors/examSession';
import { reservationSelector } from 'redux/selectors/reservation';

export const EnrollToQueue = () => {
  const dispatch = useAppDispatch();
  const { status, emailAlreadyQueued } = useAppSelector(reservationSelector);
  const { id: examSessionId } = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const { showDialog } = useDialog();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.enrollToQueue',
  });
  const translateCommon = useCommonTranslation();
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const getInputEmailError = useCallback(
    () =>
      InputFieldUtils.validateCustomTextFieldErrors({
        type: TextFieldTypes.Email,
        required: true,
        value: email,
      }),
    [email]
  );
  const getConfirmEmailError = useCallback(() => {
    if (!confirmEmail) {
      return CustomTextFieldErrors.Required;
    } else if (confirmEmail !== email) {
      return YkiValidationErrors.MismatchingEmails;
    } else {
      return '';
    }
  }, [confirmEmail, email]);

  const inputEmailError = showErrors ? getInputEmailError() : '';
  const confirmEmailError = showErrors ? getConfirmEmailError() : '';
  const handleSubmit = useCallback(() => {
    setShowErrors(true);
    if (getInputEmailError() || getConfirmEmailError()) {
      showDialog({
        title: t('dialog.inputError.title'),
        description: t('dialog.inputError.description'),
        severity: Severity.Error,
        actions: [
          { title: translateCommon('back'), variant: Variant.Contained },
        ],
      });
    } else {
      dispatch(sendReservationRequest({ email, examSessionId }));
    }
  }, [
    dispatch,
    email,
    examSessionId,
    getConfirmEmailError,
    getInputEmailError,
    showDialog,
    t,
    translateCommon,
  ]);

  useEffect(() => {
    dispatch(resetReservationRequest());
  }, [dispatch]);

  useEffect(() => {
    if (status === APIResponseStatus.Error) {
      if (emailAlreadyQueued) {
        showDialog({
          title: t('dialog.emailAlreadyQueued.title'),
          description: t('dialog.emailAlreadyQueued.description'),
          severity: Severity.Info,
          actions: [
            { title: translateCommon('back'), variant: Variant.Contained },
          ],
        });
      } else {
        showDialog({
          title: t('dialog.genericError.title'),
          description: t('dialog.genericError.description'),
          severity: Severity.Error,
          actions: [
            { title: translateCommon('back'), variant: Variant.Contained },
          ],
        });
      }
    }
  }, [emailAlreadyQueued, showDialog, status, t, translateCommon]);

  const isLoading = status === APIResponseStatus.InProgress;

  switch (status) {
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
    case APIResponseStatus.Cancelled:
    case APIResponseStatus.Error:
      return (
        <>
          <Text>
            {t('info.part1')}
            <br />
            {t('info.part2')}
          </Text>
          <div className="columns gapped-xxl">
            <LabeledTextField
              id="enroll-to-queue__input-email"
              label={t('inputs.email.heading')}
              placeholder={t('inputs.email.description')}
              autoComplete={InputAutoComplete.Email}
              error={inputEmailError !== ''}
              helperText={
                inputEmailError ? translateCommon(inputEmailError) : ' '
              }
              showHelperText={true}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <LabeledTextField
              id="enroll-to-queue__confirm-email"
              label={t('inputs.confirmEmail.heading')}
              placeholder={t('inputs.confirmEmail.description')}
              autoComplete={InputAutoComplete.Email}
              error={confirmEmailError !== ''}
              helperText={
                confirmEmailError ? translateCommon(confirmEmailError) : ' '
              }
              showHelperText={true}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="columns">
            <CustomButton
              className="full-max-width"
              color={Color.Secondary}
              variant={Variant.Contained}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {t('inputs.submit.label')}
            </CustomButton>
          </div>
        </>
      );
    case APIResponseStatus.Success:
      return (
        <>
          <H2>{t('success.heading')}</H2>
          <Text>
            {t('success.info')}: <b>{email}</b>
          </Text>
        </>
      );
  }
};
