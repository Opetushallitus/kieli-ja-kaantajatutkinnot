import { ChangeEvent, useEffect } from 'react';

import {
  ChosenTranslators,
  ChosenTranslatorsHeading,
  DisplayContactInfo,
  StepHeading,
} from 'components/contactRequest/ContactRequestFormUtils';
import { CustomTextField } from 'components/elements/CustomTextField';
import { H3 } from 'components/elements/Text';
import { translateOutsideComponent, useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { TextFieldTypes } from 'enums/app';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { useWindowProperties } from 'hooks/useWindowProperties';
import {
  setContactRequest,
  setMessageError,
} from 'redux/actions/contactRequest';
import { contactRequestSelector } from 'redux/selectors/contactRequest';
import { Utils } from 'utils';
import { StringUtils } from 'utils/string';

const getErrorForMessage = (message?: string) => {
  const t = translateOutsideComponent();
  const error = Utils.inspectCustomTextFieldErrors(
    TextFieldTypes.Textarea,
    message,
    true
  );

  return error ? t(`akt.${error}`) : '';
};

export const WriteMessage = ({
  disableNext,
}: {
  disableNext: (disabled: boolean) => void;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm',
  });

  //Windows properties
  const { isPhone } = useWindowProperties();

  // Redux
  const { request, messageError } = useAppSelector(contactRequestSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const hasBlankMessage = StringUtils.isBlankString(request?.message);
    const hasFieldError = messageError ? messageError.length > 0 : false;
    disableNext(hasBlankMessage || hasFieldError);
  }, [disableNext, messageError, request]);

  const handleMessageFieldChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const message = e.target.value;
    dispatch(setContactRequest({ message }));
    dispatch(setMessageError(getErrorForMessage(message)));
  };

  const handleMessageFieldErrors = () => {
    dispatch(setMessageError(getErrorForMessage(request?.message)));
  };

  const getHelperMessage = () => {
    const value = request?.message;
    const errorToShow = messageError ? `${messageError}.` : '';
    const maxLength = Utils.getMaxTextAreaLength();

    return `${errorToShow} ${value?.length} / ${maxLength} ${t('characters')}`;
  };

  return (
    <div className="rows">
      <StepHeading step={ContactRequestFormStep.WriteMessage} />
      <div className="rows gapped">
        <ChosenTranslatorsHeading />
        <ChosenTranslators />
        {!isPhone && <DisplayContactInfo />}
        <div className="rows gapped">
          <H3>
            {t(
              `steps.${
                ContactRequestFormStep[ContactRequestFormStep.WriteMessage]
              }`
            )}
          </H3>
          <CustomTextField
            id="contact-request-page__message-field"
            label={t('formLabels.writeMessageHere')}
            value={request?.message}
            type={TextFieldTypes.Textarea}
            onChange={handleMessageFieldChange}
            onBlur={handleMessageFieldErrors}
            showHelperText
            helperText={getHelperMessage()}
            error={messageError.length > 0}
            multiline
            fullWidth
            required
          />
        </div>
      </div>
    </div>
  );
};
