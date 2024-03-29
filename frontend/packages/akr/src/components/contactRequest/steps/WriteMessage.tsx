import { ChangeEvent, useEffect } from 'react';
import { CustomTextField, H2, Text } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';
import { InputFieldUtils, StringUtils } from 'shared/utils';

import {
  ChosenTranslators,
  ChosenTranslatorsHeading,
  StepHeading,
} from 'components/contactRequest/ContactRequestFormUtils';
import { translateOutsideComponent, useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import {
  setContactRequestMessageError,
  updateContactRequest,
} from 'redux/reducers/contactRequest';
import { contactRequestSelector } from 'redux/selectors/contactRequest';

const getErrorForMessage = (message?: string) => {
  const t = translateOutsideComponent();
  const error = InputFieldUtils.inspectCustomTextFieldErrors(
    TextFieldTypes.Textarea,
    message,
    true,
    6000,
  );

  return error ? t(`akr.${error}`) : '';
};

export const WriteMessage = ({
  disableNext,
}: {
  disableNext: (disabled: boolean) => void;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm',
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
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const message = e.target.value;
    dispatch(updateContactRequest({ message }));
    dispatch(setContactRequestMessageError(getErrorForMessage(message)));
  };

  const handleMessageFieldErrors = () => {
    dispatch(
      setContactRequestMessageError(getErrorForMessage(request?.message)),
    );
  };

  const getHelperMessage = () => {
    const value = request?.message;
    const errorToShow = messageError ? `${messageError}.` : '';
    const maxLength = InputFieldUtils.defaultMaxTextAreaLength;

    return `${errorToShow} ${value?.length} / ${maxLength} ${t('characters')}`;
  };

  return (
    <div className="rows">
      <StepHeading step={ContactRequestFormStep.WriteMessage} />
      <div className="rows gapped">
        <div className="rows gapped-xs">
          <ChosenTranslatorsHeading />
          <ChosenTranslators />
        </div>
        <H2>{t('writeMessage.title')}</H2>
        <div className="rows gapped-xxs">
          <Text>
            <span className="bold">{t('writeMessage.message')}</span>
            {' ('}
            {t('writeMessage.mandatory')}
            {')'}
          </Text>
          <CustomTextField
            data-testid="contact-request-page__message-field"
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
            minRows={isPhone ? 10 : 5}
          />
        </div>
      </div>
    </div>
  );
};
