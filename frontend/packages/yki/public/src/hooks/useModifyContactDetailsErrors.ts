import { CustomTextFieldErrors, TextFieldTypes } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { useAppSelector } from 'configs/redux';
import { YkiValidationErrors } from 'enums/app';
import { ModifyContactDetails } from 'interfaces/userDetails';
import { userDetailsSelector } from 'redux/selectors/userDetails';

type ModifyContactDetailsErrors = {
  [field in keyof Partial<ModifyContactDetails>]: string;
};

const getErrors = (
  showErrors: boolean,
  modifyContactDetails: Partial<ModifyContactDetails>,
) => {
  if (!showErrors) {
    return {};
  }
  const errors: ModifyContactDetailsErrors = {};
  errors['streetAddress'] = InputFieldUtils.validateCustomTextFieldErrors({
    type: TextFieldTypes.Text,
    required: true,
    value: modifyContactDetails.streetAddress,
  });
  errors['zip'] = InputFieldUtils.validateCustomTextFieldErrors({
    type: TextFieldTypes.Text,
    required: true,
    value: modifyContactDetails.zip,
  });
  errors['postOffice'] = InputFieldUtils.validateCustomTextFieldErrors({
    type: TextFieldTypes.Text,
    required: true,
    value: modifyContactDetails.postOffice,
  });
  errors['phoneNumber'] = InputFieldUtils.validateCustomTextFieldErrors({
    type: TextFieldTypes.PhoneNumber,
    required: true,
    value: modifyContactDetails.phoneNumber,
  });

  errors['email'] = InputFieldUtils.validateCustomTextFieldErrors({
    type: TextFieldTypes.Email,
    required: true,
    value: modifyContactDetails.email,
  });

  errors['confirmEmail'] =
    modifyContactDetails.email !== modifyContactDetails.confirmEmail
      ? YkiValidationErrors.MismatchingEmails
      : '';

  errors['countryCode'] = modifyContactDetails.countryCode
    ? ''
    : CustomTextFieldErrors.Required;

  return errors;
};

export const useModifyContactDetailsErrors = (showErrors: boolean) => {
  const { modifyContactDetails } = useAppSelector(userDetailsSelector);

  return () => getErrors(showErrors, modifyContactDetails);
};
