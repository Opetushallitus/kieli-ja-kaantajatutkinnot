import {
  ArrowBackOutlined as ArrowBackIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from '@mui/icons-material';
import { AppBar, Toolbar } from '@mui/material';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useWindowProperties } from 'shared/hooks';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { ContactRequest } from 'interfaces/contactRequest';
import {
  decreaseFormStep,
  increaseFormStep,
  sendContactRequest,
} from 'redux/actions/contactRequest';
import { NOTIFIER_ACTION_CONTACT_REQUEST_RESET } from 'redux/actionTypes/notifier';
import { contactRequestSelector } from 'redux/selectors/contactRequest';

export const ControlButtons = ({
  disableNext,
  hasLocalChanges,
}: {
  disableNext: boolean;
  hasLocalChanges: boolean;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm',
  });
  const translateCommon = useCommonTranslation();

  // Redux
  const dispatch = useAppDispatch();
  const { request, activeStep, status, error } = useAppSelector(
    contactRequestSelector
  ) as {
    request: ContactRequest;
    activeStep: ContactRequestFormStep;
    status: APIResponseStatus;
    error: AxiosError;
  };

  const { showDialog } = useDialog();

  const { isPhone } = useWindowProperties();
  const isLoading = status === APIResponseStatus.InProgress;

  const [showDialogOnError, setShowDialogOnError] = useState(true);

  const onContactRequestSubmit = () => {
    setShowDialogOnError(true);
    dispatch(sendContactRequest(request));
  };

  useEffect(() => {
    if (error && showDialogOnError) {
      setShowDialogOnError(false);
      showDialog(
        t('errorDialog.title'),
        Severity.Error,
        t('errorDialog.description'),
        [{ title: t('errorDialog.back'), variant: Variant.Contained }]
      );
    }
  }, [error, showDialog, showDialogOnError, t]);

  const handleCancelBtnClick = () => {
    if (hasLocalChanges) {
      showDialog(
        t('cancelRequestDialog.title'),
        Severity.Info,
        t('cancelRequestDialog.description'),
        [
          {
            title: translateCommon('back'),
            variant: Variant.Outlined,
          },
          {
            title: translateCommon('yes'),
            variant: Variant.Contained,
            action: () =>
              dispatch({ type: NOTIFIER_ACTION_CONTACT_REQUEST_RESET }),
          },
        ]
      );
    } else {
      dispatch({ type: NOTIFIER_ACTION_CONTACT_REQUEST_RESET });
    }
  };

  const dispatchStepIncrement = () => {
    dispatch(increaseFormStep);
  };

  const dispatchStepDecrement = () => {
    dispatch(decreaseFormStep);
  };

  const renderCancelButton = () => (
    <>
      <CustomButton
        variant={Variant.Text}
        color={Color.Secondary}
        onClick={handleCancelBtnClick}
        data-testid="contact-request-page__cancel-btn"
        disabled={isLoading}
      >
        {translateCommon('cancel')}
      </CustomButton>
    </>
  );

  const renderBackButton = () => (
    <CustomButton
      variant={Variant.Outlined}
      color={Color.Secondary}
      onClick={dispatchStepDecrement}
      disabled={
        activeStep == ContactRequestFormStep.VerifyTranslators || isLoading
      }
      startIcon={<ArrowBackIcon />}
      data-testid="contact-request-page__previous-btn"
    >
      {translateCommon('back')}
    </CustomButton>
  );

  const renderNextAndSubmitButtons = () => (
    <>
      {activeStep == ContactRequestFormStep.PreviewAndSend ? (
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            variant={Variant.Contained}
            color={Color.Secondary}
            onClick={onContactRequestSubmit}
            data-testid="contact-request-page__submit-btn"
            endIcon={<ArrowForwardIcon />}
            disabled={isLoading}
          >
            {translateCommon('send')}
          </CustomButton>
        </LoadingProgressIndicator>
      ) : (
        <CustomButton
          variant={Variant.Contained}
          color={Color.Secondary}
          disabled={disableNext}
          onClick={dispatchStepIncrement}
          endIcon={<ArrowForwardIcon />}
          data-testid="contact-request-page__next-btn"
        >
          {translateCommon('next')}
        </CustomButton>
      )}
    </>
  );

  return isPhone ? (
    <AppBar className="contact-request-page__app-bar">
      <Toolbar className="contact-request-page__app-bar__tool-bar space-between">
        {activeStep === ContactRequestFormStep.VerifyTranslators &&
          renderCancelButton()}
        {activeStep !== ContactRequestFormStep.VerifyTranslators &&
          renderBackButton()}
        {renderNextAndSubmitButtons()}
      </Toolbar>
    </AppBar>
  ) : (
    <div className="columns flex-end gapped margin-top-xxl">
      {renderCancelButton()}
      {renderBackButton()}
      {renderNextAndSubmitButtons()}
    </div>
  );
};
