import { Box, Paper } from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CustomButton,
  CustomTextField,
  H1,
  H2,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
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
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { ClerkTranslatorEmail } from 'interfaces/clerkTranslatorEmail';
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

const ControlButtons = ({
  isLoading,
  submitDisabled,
}: {
  isLoading: boolean;
  submitDisabled: boolean;
}) => {
  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.pages.clerkSendEmailPage',
  });
  const translateCommon = useCommonTranslation();

  // Redux
  const dispatch = useAppDispatch();
  const translatorIds = useAppSelector(selectFilteredSelectedIds);

  // Dialogs
  const { showDialog } = useDialog();

  const dispatchCancelNotifier = () => {
    showDialog({
      title: t('dialogs.cancel.title'),
      severity: Severity.Info,
      description: t('dialogs.cancel.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => dispatch(cancelClerkTranslatorEmail()),
        },
      ],
    });
  };

  const dispatchSendEmailNotifier = () => {
    dispatch(setClerkTranslatorEmailRecipients(translatorIds));
    showDialog({
      title: t('dialogs.send.title'),
      severity: Severity.Info,
      description: t('dialogs.send.description', {
        count: translatorIds.length,
      }),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => {
            dispatch(sendClerkTranslatorEmail());
          },
        },
      ],
    });
  };

  return (
    <div className="columns gapped flex-end">
      <CustomButton
        disabled={isLoading}
        data-testid="clerk-send-email-page__cancel-btn"
        variant={Variant.Outlined}
        color={Color.Secondary}
        onClick={dispatchCancelNotifier}
      >
        {translateCommon('cancel')}
      </CustomButton>
      <LoadingProgressIndicator isLoading={isLoading}>
        <CustomButton
          data-testid="clerk-send-email-page__send-btn"
          variant={Variant.Contained}
          color={Color.Secondary}
          disabled={submitDisabled}
          onClick={dispatchSendEmailNotifier}
        >
          {translateCommon('send')}
        </CustomButton>
      </LoadingProgressIndicator>
    </div>
  );
};

export const ClerkSendEmailPage = () => {
  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr',
  });

  // Redux
  const translators = useAppSelector(selectFilteredSelectedTranslators);
  const { email, status } = useAppSelector(selectClerkTranslatorEmail);
  const isLoading = status === APIResponseStatus.InProgress;

  const dispatch = useAppDispatch();
  const setEmailSubject = (subject: string) =>
    dispatch(setClerkTranslatorEmail({ subject }));
  const setEmailBody = (body: string) =>
    dispatch(setClerkTranslatorEmail({ body }));

  // Local state
  const initialFieldErrors = { subject: '', message: '' };
  const [fieldErrors, setFieldErrors] =
    useState<typeof initialFieldErrors>(initialFieldErrors);

  const emptyBody = StringUtils.isBlankString(email.body);
  const emptySubject = StringUtils.isBlankString(email.subject);
  const submitDisabled =
    isLoading ||
    emptySubject ||
    emptyBody ||
    fieldErrors.message.length > 0 ||
    translators.length == 0;

  // Navigation
  const navigate = useNavigate();

  const { showToast } = useToast();

  // Enable navigation protection when subject or body are modified.
  // Disable navigation protection if API request succeeds or is cancelled.
  useNavigationProtection(
    (!emptyBody || !emptySubject) &&
      !(
        status === APIResponseStatus.Success ||
        status === APIResponseStatus.Cancelled
      ),
  );

  // Show toast on success.
  // If an error occurs, a corresponding toast is shown from within the saga.
  // Finally, if API request succeeds or is cancelled, reset input fields and
  // navigate back to the clerk registry view.
  useEffect(() => {
    if (status == APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('pages.clerkSendEmailPage.toasts.success'),
      });
    }
    if (
      status == APIResponseStatus.Success ||
      status == APIResponseStatus.Cancelled
    ) {
      dispatch(resetClerkTranslatorEmail());
      navigate(AppRoutes.ClerkHomePage);
    }
  }, [dispatch, navigate, showToast, status, t]);

  const maxTextAreaLength = 10000;
  const handleFieldError =
    (field: 'subject' | 'message') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value, required } = event.target;
      const error = InputFieldUtils.inspectCustomTextFieldErrors(
        field == 'subject' ? TextFieldTypes.Text : TextFieldTypes.Textarea,
        value,
        required,
        maxTextAreaLength,
      );
      const errorMessage = error ? t(error) : '';
      setFieldErrors({ ...fieldErrors, [field]: errorMessage });
    };

  const handleSubjectChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setEmailSubject(event.target.value);
    handleFieldError('subject')(event);
  };

  const handleMessageChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setEmailBody(event.target.value);
    handleFieldError('message')(event);
  };

  const getHelperMessage = useCallback(
    (email: ClerkTranslatorEmail, fieldErrors: typeof initialFieldErrors) => {
      const value = email.body;
      const errorToShow =
        fieldErrors.message.length > 0 ? `${fieldErrors.message}.` : '';

      return `${errorToShow} ${value?.length} / ${maxTextAreaLength} ${t(
        'pages.clerkSendEmailPage.characters',
      )}`;
    },
    [t],
  );

  return (
    <Box className="clerk-send-email-page">
      <H1>{t('pages.clerkSendEmailPage.title')}</H1>
      <Paper className="clerk-send-email-page__form-container" elevation={3}>
        <div className="rows gapped clerk-send-email-page__form-contents">
          <div className="rows gapped">
            <H2>{t('pages.clerkSendEmailPage.sections.recipients')}</H2>
            <Text>
              {t('pages.clerkSendEmailPage.selectedCount', {
                count: translators.length,
              })}
            </Text>
          </div>
          <div className="rows gapped">
            <H2>{t('pages.clerkSendEmailPage.sections.subject')}</H2>
            <CustomTextField
              disabled={isLoading}
              data-testid="clerk-send-email-page__subject"
              label={t('pages.clerkSendEmailPage.labels.subject')}
              value={email.subject}
              onChange={handleSubjectChange}
              onBlur={handleFieldError('subject')}
              error={fieldErrors.subject.length > 0}
              helperText={fieldErrors.subject}
              required
            />
          </div>
          <div className="rows gapped">
            <H2>{t('pages.clerkSendEmailPage.sections.message')}</H2>
            <CustomTextField
              disabled={isLoading}
              data-testid="clerk-send-email-page__message"
              label={t('pages.clerkSendEmailPage.labels.message')}
              value={email.body}
              onChange={handleMessageChange}
              onBlur={handleFieldError('message')}
              error={fieldErrors.message.length > 0}
              helperText={getHelperMessage(email, fieldErrors)}
              showHelperText
              multiline
              required
            />
          </div>
        </div>
        <ControlButtons isLoading={isLoading} submitDisabled={submitDisabled} />
      </Paper>
    </Box>
  );
};
