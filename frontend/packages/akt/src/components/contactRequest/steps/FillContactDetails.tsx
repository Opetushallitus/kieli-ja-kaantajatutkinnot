import { ChangeEvent, useEffect, useState } from 'react';
import { CustomTextField, H3 } from 'shared/components';

import {
  ChosenTranslators,
  ChosenTranslatorsHeading,
  StepHeading,
} from 'components/contactRequest/ContactRequestFormUtils';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { TextFieldTypes } from 'enums/app';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { ContactDetails } from 'interfaces/contactRequest';
import { setContactRequest } from 'redux/actions/contactRequest';
import { contactRequestSelector } from 'redux/selectors/contactRequest';
import { Utils } from 'utils';
import { StringUtils } from 'utils/string';

export const FillContactDetails = ({
  disableNext,
  onDataChanged,
}: {
  disableNext: (disabled: boolean) => void;
  onDataChanged: () => void;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akt',
  });

  // State
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  // Redux
  const dispatch = useAppDispatch();
  const { request } = useAppSelector(contactRequestSelector);

  useEffect(() => {
    const requiredFieldValues = [
      request?.firstName,
      request?.lastName,
      request?.email,
    ];
    const hasFieldErrors = !!(
      fieldErrors.firstName ||
      fieldErrors.lastName ||
      fieldErrors.email
    );
    const hasBlankRequiredFields = requiredFieldValues.some((v) =>
      StringUtils.isBlankString(v)
    );

    disableNext(hasFieldErrors || hasBlankRequiredFields);
  }, [fieldErrors, disableNext, request]);

  const handleContactDetailsChange =
    (fieldName: keyof ContactDetails) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (fieldErrors[fieldName]) {
        handleContactDetailsErrors(fieldName)(event);
      }

      onDataChanged();
      dispatch(
        setContactRequest({
          [fieldName]: event.target.value,
        })
      );
    };

  const handleContactDetailsErrors =
    (fieldName: keyof ContactDetails) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { type, value, required } = event.target;
      const error = Utils.inspectCustomTextFieldErrors(
        type as TextFieldTypes,
        value,
        required
      );

      const errorMessage = error ? t(error) : '';
      setFieldErrors({ ...fieldErrors, [fieldName]: errorMessage });
    };

  const showCustomTextFieldError = (fieldName: keyof ContactDetails) => {
    return fieldErrors[fieldName]?.length > 0;
  };

  const getCustomTextFieldAttributes = (fieldName: keyof ContactDetails) => ({
    id: `contact-details__${fieldName}-field`,
    label: t(`component.contactRequestForm.formLabels.${fieldName}`),
    onBlur: handleContactDetailsErrors(fieldName),
    onChange: handleContactDetailsChange(fieldName),
    error: showCustomTextFieldError(fieldName),
    helperText: fieldErrors[fieldName],
  });

  return (
    <div className="rows">
      <StepHeading step={ContactRequestFormStep.FillContactDetails} />
      <div className="rows gapped">
        <ChosenTranslatorsHeading />
        <ChosenTranslators />
        <div className="rows gapped">
          <H3>
            {t(
              'component.contactRequestForm.steps.' +
                ContactRequestFormStep[
                  ContactRequestFormStep.FillContactDetails
                ]
            )}
          </H3>
          <div className="grid-columns gapped">
            <CustomTextField
              {...getCustomTextFieldAttributes('firstName')}
              value={request?.firstName}
              type={TextFieldTypes.Text}
              required
            />
            <CustomTextField
              {...getCustomTextFieldAttributes('lastName')}
              type={TextFieldTypes.Text}
              value={request?.lastName}
              required
            />
          </div>
          <div className="grid-columns gapped">
            <CustomTextField
              {...getCustomTextFieldAttributes('email')}
              type={TextFieldTypes.Email}
              value={request?.email}
              required
            />
            <CustomTextField
              {...getCustomTextFieldAttributes('phoneNumber')}
              value={request?.phoneNumber}
              type={TextFieldTypes.PhoneNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
