import { useEffect, ChangeEvent, useState } from 'react';

import { H3 } from 'components/elements/Text';
import { useAppTranslation } from 'configs/i18n';
import { useAppSelector, useAppDispatch } from 'configs/redux';
import { TextBoxTypes } from 'enums/app';
import { TextBox } from 'components/elements/TextBox';
import {
  StepHeading,
  stepsByIndex,
  ChosenTranslatorsHeading,
  RenderChosenTranslators,
  DisplayContactInfo,
} from 'components/contactRequest/ContactRequestFormUtils';
import { Utils } from 'utils';
import { setContactRequest } from 'redux/actions/contactRequest';
import { contactRequestSelector } from 'redux/selectors/contactRequest';

export const WriteMessage = ({
  disableNext,
}: {
  disableNext: (disabled: boolean) => void;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akt',
  });

  // State
  const [fieldError, setFieldError] = useState('');

  // Redux
  const { request } = useAppSelector(contactRequestSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const hasEmptyMessage = !!!request?.message;
    const hasFieldError = fieldError.length > 0;

    disableNext(hasEmptyMessage || hasFieldError);
  }, [disableNext, fieldError, request]);

  const handleMessageFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (fieldError) {
      handleMessageFieldErrors(event);
    }
    dispatch(setContactRequest({ message: event.target.value }));
  };

  const handleMessageFieldErrors = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { type, value, required } = event.target;
    const error = Utils.inspectTextBoxErrors(
      type as TextBoxTypes,
      value,
      required
    );

    const errorMessage = error ? t(error) : '';
    setFieldError(errorMessage);
  };

  const getHelperMessage = () => {
    const value = request?.message;
    const errorToShow = fieldError ? `${fieldError}.` : '';

    return `${errorToShow} ${value?.length} ${t(
      'component.contactRequestForm.characters'
    )} `;
  };

  return (
    <div className="rows">
      <StepHeading step={stepsByIndex[2]} />
      <div className="rows gapped">
        <ChosenTranslatorsHeading />
        <RenderChosenTranslators />
        <DisplayContactInfo />
        <div className="rows gapped">
          <H3>{t(`component.contactRequestForm.steps.${stepsByIndex[2]}`)}</H3>
          <TextBox
            id="contact-request-page__message-field"
            label={t(
              'component.contactRequestForm.formLabels.writeMessageHere'
            )}
            value={request?.message}
            type={TextBoxTypes.Textarea}
            onBlur={handleMessageFieldErrors}
            onChange={handleMessageFieldChange}
            showHelperText
            helperText={getHelperMessage()}
            rows={5}
            error={fieldError.length > 0}
            multiline
            fullWidth
            required
          />
        </div>
      </div>
    </div>
  );
};
