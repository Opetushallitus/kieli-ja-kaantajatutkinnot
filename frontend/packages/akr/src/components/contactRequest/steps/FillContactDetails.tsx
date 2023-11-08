import { ChangeEvent, useEffect, useState } from 'react';
import { CustomTextField, Text } from 'shared/components';
import { InputAutoComplete, TextFieldTypes } from 'shared/enums';
import { InputFieldUtils, StringUtils } from 'shared/utils';

import { StepHeading } from 'components/contactRequest/ContactRequestFormUtils';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { ContactDetails } from 'interfaces/contactRequest';
import { updateContactRequest } from 'redux/reducers/contactRequest';
import { contactRequestSelector } from 'redux/selectors/contactRequest';

export const FillContactDetails = ({
  disableNext,
  onDataChanged,
}: {
  disableNext: (disabled: boolean) => void;
  onDataChanged: () => void;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr',
  });
  const translateCommon = useCommonTranslation();

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
      fieldErrors.email ||
      fieldErrors.phoneNumber
    );
    const hasBlankRequiredFields = requiredFieldValues.some((v) =>
      StringUtils.isBlankString(v),
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
        updateContactRequest({
          [fieldName]: event.target.value,
        }),
      );
    };

  const handleContactDetailsErrors =
    (fieldName: keyof ContactDetails) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { type, value, required } = event.target;
      const error = InputFieldUtils.inspectCustomTextFieldErrors(
        type as TextFieldTypes,
        value,
        required,
        255,
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
        <Text>{translateCommon('requiredFieldsInfo')}</Text>
        <div className="grid-columns gapped">
          <CustomTextField
            {...getCustomTextFieldAttributes('firstName')}
            value={request?.firstName}
            type={TextFieldTypes.Text}
            required
            autoComplete={InputAutoComplete.FirstName}
          />
          <CustomTextField
            {...getCustomTextFieldAttributes('lastName')}
            type={TextFieldTypes.Text}
            value={request?.lastName}
            required
            autoComplete={InputAutoComplete.LastName}
          />
        </div>
        <div className="grid-columns gapped">
          <CustomTextField
            {...getCustomTextFieldAttributes('email')}
            type={TextFieldTypes.Email}
            value={request?.email}
            required
            autoComplete={InputAutoComplete.Email}
          />
          <CustomTextField
            {...getCustomTextFieldAttributes('phoneNumber')}
            value={request?.phoneNumber}
            type={TextFieldTypes.PhoneNumber}
            autoComplete={InputAutoComplete.PhoneNumber}
          />
        </div>
      </div>
    </div>
  );
};
