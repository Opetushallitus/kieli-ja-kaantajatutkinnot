import { Box, Paper } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, CustomTextField, H1, H2, Text } from 'shared/components';
import {
  APIResponseStatus,
  Color,
  Severity,
  TextFieldTypes,
  Variant,
} from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { InputFieldUtils, StringUtils } from 'shared/utils';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  cancelClerkTranslatorEmail,
  resetClerkTranslatorEmail,
  sendClerkTranslatorEmail,
  setClerkTranslatorEmail,
  setClerkTranslatorEmailRecipients,
} from 'redux/reducers/clerkTranslatorEmail';
import {
  selectFilteredSelectedIds,
  selectFilteredSelectedTranslators,
} from 'redux/selectors/clerkTranslator';
import { selectClerkTranslatorEmail } from 'redux/selectors/clerkTranslatorEmail';

const ControlButtons = ({ submitDisabled }: { submitDisabled: boolean }) => {
  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.pages.clerkSendEmailPage',
  });
  const translateCommon = useCommonTranslation();

  // Redux
  const dispatch = useAppDispatch();
  const translatorIds = useAppSelector(selectFilteredSelectedIds);
  const { status } = useAppSelector(selectClerkTranslatorEmail);

  // Dialogs
  const { showDialog } = useDialog();
  const { showToast } = useToast();

  const [showToastOnError, setShowToastOnError] = useState(false);

  useEffect(() => {
    if (status == APIResponseStatus.Error && showToastOnError) {
      setShowToastOnError(false);
      showToast(Severity.Error, t('toasts.error'));
    }
  }, [showToast, showToastOnError, status, t]);

  const dispatchCancelNotifier = () => {
    showDialog(
      t('dialogs.cancel.title'),
      Severity.Info,
      t('dialogs.cancel.description'),
      [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => dispatch(cancelClerkTranslatorEmail()),
        },
      ]
    );
  };

  const dispatchSendEmailNotifier = () => {
    dispatch(setClerkTranslatorEmailRecipients(translatorIds));
    showDialog(
      t('dialogs.send.title'),
      Severity.Info,
      t('dialogs.send.description', { count: translatorIds.length }),
      [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => {
            setShowToastOnError(true);
            dispatch(sendClerkTranslatorEmail());
          },
        },
      ]
    );
  };

  return (
    <div className="columns gapped flex-end">
      <CustomButton
        data-testid="clerk-send-email-page__cancel-btn"
        variant={Variant.Outlined}
        color={Color.Secondary}
        onClick={dispatchCancelNotifier}
      >
        {translateCommon('cancel')}
      </CustomButton>
      <CustomButton
        data-testid="clerk-send-email-page__send-btn"
        variant={Variant.Contained}
        color={Color.Secondary}
        disabled={submitDisabled}
        onClick={dispatchSendEmailNotifier}
      >
        {translateCommon('send')}
      </CustomButton>
    </div>
  );
};

export const ClerkSendEmailPage = () => {
  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.pages.clerkSendEmailPage',
  });

  // Redux
  const translators = useAppSelector(selectFilteredSelectedTranslators);
  const { email, status } = useAppSelector(selectClerkTranslatorEmail);
  const dispatch = useAppDispatch();
  const setEmailSubject = (subject: string) =>
    dispatch(setClerkTranslatorEmail({ subject }));
  const setEmailBody = (body: string) =>
    dispatch(setClerkTranslatorEmail({ body }));

  // Local state
  const initialFieldErrors = { subject: '', message: '' };
  const [fieldErrors, setFieldErrors] =
    useState<typeof initialFieldErrors>(initialFieldErrors);
  const submitDisabled =
    StringUtils.isBlankString(email.subject) ||
    StringUtils.isBlankString(email.body) ||
    translators.length == 0;

  // Navigation
  const navigate = useNavigate();

  const { showToast } = useToast();
  useEffect(() => {
    if (
      status == APIResponseStatus.Success ||
      status == APIResponseStatus.Cancelled
    ) {
      showToast(Severity.Success, t('toasts.success'));
      dispatch(resetClerkTranslatorEmail());
      navigate(AppRoutes.ClerkHomePage);
    }
  }, [dispatch, navigate, showToast, status, t]);

  const handleFieldError =
    (field: 'subject' | 'message') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value, required } = event.target;
      const error = InputFieldUtils.inspectCustomTextFieldErrors(
        field == 'subject' ? TextFieldTypes.Text : TextFieldTypes.Textarea,
        value,
        required
      );
      const errorMessage = error ? t(error) : '';
      setFieldErrors({ ...fieldErrors, [field]: errorMessage });
    };

  const handleSubjectChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEmailSubject(event.target.value);
    handleFieldError('subject')(event);
  };

  const handleMessageChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEmailBody(event.target.value);
    handleFieldError('message')(event);
  };

  return (
    <Box className="clerk-send-email-page">
      <H1>{t('title')}</H1>
      <Paper className="clerk-send-email-page__form-container" elevation={3}>
        <div className="rows gapped clerk-send-email-page__form-contents">
          <div className="rows gapped">
            <H2>{t('sections.recipients')}</H2>
            <Text>
              {t('selectedCount', {
                count: translators.length,
              })}
            </Text>
          </div>
          <div className="rows gapped">
            <H2>{t('sections.subject')}</H2>
            <CustomTextField
              data-testid="clerk-send-email-page__subject"
              label={t('labels.subject')}
              value={email.subject}
              onChange={handleSubjectChange}
              onBlur={handleFieldError('subject')}
              error={fieldErrors.subject.length > 0}
              helperText={fieldErrors.subject}
              required
            />
          </div>
          <div className="rows gapped">
            <H2>{t('sections.message')}</H2>
            <CustomTextField
              data-testid="clerk-send-email-page__message"
              label={t('labels.message')}
              value={email.body}
              onChange={handleMessageChange}
              onBlur={handleFieldError('message')}
              error={fieldErrors.message.length > 0}
              helperText={fieldErrors.message}
              multiline
              required
            />
          </div>
        </div>
        <ControlButtons submitDisabled={submitDisabled} />
      </Paper>
    </Box>
  );
};
