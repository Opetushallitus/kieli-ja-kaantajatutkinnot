import { TextFieldTypes } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { useAppSelector } from 'configs/redux';
import {
  PublicEmailRegistration,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';
import { registrationSelector } from 'redux/selectors/registration';

type PublicRegistrationErrors = {
  [field in keyof Partial<
    PublicEmailRegistration & PublicSuomiFiRegistration
  >]: string;
};

const getErrors = (
  showErrors: boolean,
  isEmailRegistration: boolean,
  registration: Partial<PublicEmailRegistration & PublicSuomiFiRegistration>
) => {
  if (!showErrors) {
    return {};
  }
  const errors: PublicRegistrationErrors = {};
  if (!registration.certificateLanguage) {
    errors['certificateLanguage'] = 'required';
  }
  if (!registration.termsAndConditionsAgreed) {
    errors['termsAndConditionsAgreed'] = 'required';
  }
  if (!registration.privacyStatementConfirmation) {
    errors['privacyStatementConfirmation'] = 'required';
  }

  errors['address'] = InputFieldUtils.validateCustomTextFieldErrors({
    type: TextFieldTypes.Text,
    required: true,
    value: registration.address,
  });
  errors['postNumber'] = InputFieldUtils.validateCustomTextFieldErrors({
    type: TextFieldTypes.Text,
    required: true,
    value: registration.postNumber,
  });
  errors['postOffice'] = InputFieldUtils.validateCustomTextFieldErrors({
    type: TextFieldTypes.Text,
    required: true,
    value: registration.postOffice,
  });
  errors['phoneNumber'] = InputFieldUtils.validateCustomTextFieldErrors({
    type: TextFieldTypes.PhoneNumber,
    required: true,
    value: registration.phoneNumber,
  });

  if (isEmailRegistration) {
    errors['firstNames'] = InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.Text,
      required: true,
      value: registration.firstNames,
    });
    errors['lastName'] = InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.Text,
      required: true,
      value: registration.lastName,
    });
  } else {
    errors['email'] = InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.Email,
      required: true,
      value: registration.email,
    });
    errors['emailConfirmation'] =
      registration.email !== registration.emailConfirmation
        ? 'errors.mismatchingEmailsError'
        : '';
  }

  return errors;
};

export const usePublicRegistrationErrors = (showErrors: boolean) => {
  const { isEmailRegistration, registration } =
    useAppSelector(registrationSelector);

  return () =>
    getErrors(showErrors, isEmailRegistration as boolean, registration);
};
