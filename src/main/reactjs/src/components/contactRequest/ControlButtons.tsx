import { Button } from '@mui/material';

import { ContactRequest } from 'interfaces/contactRequest';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { contactRequestSelector } from 'redux/selectors/contactRequest';
import {
  decreaseFormStep,
  increaseFormStep,
  sendContactRequest,
} from 'redux/actions/contactRequest';
import { showNotifierDialog } from 'redux/actions/notifier';
import {
  NOTIFIER_ACTION_CONTACT_REQUEST_RESET,
  NOTIFIER_ACTION_DO_NOTHING,
} from 'redux/actionTypes/notifier';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { Variant, Severity } from 'enums/app';
import { Utils } from 'utils';

export const ControlButtons = ({ disableNext }: { disableNext: boolean }) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm',
  });

  // Redux
  const dispatch = useAppDispatch();
  const { request, activeStep } = useAppSelector(contactRequestSelector) as {
    request: ContactRequest;
    activeStep: ContactRequestFormStep;
  };

  const submit = () => {
    dispatch(sendContactRequest(request));
  };

  const dispatchCancelNotifier = () => {
    const notifier = Utils.createNotifierDialog(
      t('cancelRequestDialog.title'),
      Severity.Info,
      t('cancelRequestDialog.description'),
      [
        {
          title: t('cancelRequestDialog.back'),
          variant: Variant.Outlined,
          action: NOTIFIER_ACTION_DO_NOTHING,
        },
        {
          title: t('cancelRequestDialog.yes'),
          variant: Variant.Contained,
          action: NOTIFIER_ACTION_CONTACT_REQUEST_RESET,
        },
      ]
    );

    dispatch(showNotifierDialog(notifier));
  };

  const dispatchStepIncrement = () => {
    dispatch(increaseFormStep);
  };

  const dispatchStepDecrement = () => {
    dispatch(decreaseFormStep);
  };

  return (
    <div className="columns flex-end gapped m-margin-top">
      <Button
        variant="outlined"
        color="secondary"
        onClick={dispatchCancelNotifier}
        data-testid="contact-request-page__cancel-btn"
      >
        {t('buttons.cancel')}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={dispatchStepDecrement}
        disabled={activeStep == ContactRequestFormStep.VerifyTranslators}
        data-testid="contact-request-page__previous-btn"
      >
        {t('buttons.previous')}
      </Button>
      {activeStep == ContactRequestFormStep.PreviewAndSend ? (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => submit()}
          data-testid="contact-request-page__submit-btn"
        >
          {t('buttons.submit')}
        </Button>
      ) : (
        <Button
          variant="contained"
          color="secondary"
          disabled={disableNext}
          onClick={dispatchStepIncrement}
          data-testid="contact-request-page__next-btn"
        >
          {t('buttons.next')}
        </Button>
      )}
    </div>
  );
};
