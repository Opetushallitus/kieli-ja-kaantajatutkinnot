import { CustomTextFieldErrors, TextFieldTypes } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { useAppSelector } from 'configs/redux';
import { YkiValidationErrors } from 'enums/app';
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
    if (!registration.gender) {
      errors['gender'] = CustomTextFieldErrors.Required;
    }
    if (!registration.nationality) {
      errors['nationality'] = CustomTextFieldErrors.Required;
    }
    if (registration.hasSSN === undefined) {
      errors['hasSSN'] = CustomTextFieldErrors.Required;
    }
    if (registration.hasSSN) {
      errors['ssn'] = InputFieldUtils.validateCustomTextFieldErrors({
        type: TextFieldTypes.PersonalIdentityCode,
        required: true,
        value: registration.ssn,
      });
    } else {
      errors['dateOfBirth'] = InputFieldUtils.validateCustomTextFieldErrors({
        type: TextFieldTypes.Date,
        required: true,
        value: registration.dateOfBirth,
      });
    }
  } else {
    errors['email'] = InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.Email,
      required: true,
      value: registration.email,
    });
    errors['emailConfirmation'] =
      registration.email !== registration.emailConfirmation
        ? YkiValidationErrors.MismatchingEmails
        : '';
  }

  if (!registration.instructionLanguage) {
    errors['instructionLanguage'] = CustomTextFieldErrors.Required;
  }
  if (!registration.certificateLanguage) {
    errors['certificateLanguage'] = CustomTextFieldErrors.Required;
  }
  if (!registration.termsAndConditionsAgreed) {
    errors['termsAndConditionsAgreed'] = CustomTextFieldErrors.Required;
  }
  if (!registration.privacyStatementConfirmation) {
    errors['privacyStatementConfirmation'] = CustomTextFieldErrors.Required;
  }

  return errors;
};

export const usePublicRegistrationErrors = (showErrors: boolean) => {
  const { isEmailRegistration, registration } =
    useAppSelector(registrationSelector);

  return () =>
    getErrors(showErrors, isEmailRegistration as boolean, registration);
};
