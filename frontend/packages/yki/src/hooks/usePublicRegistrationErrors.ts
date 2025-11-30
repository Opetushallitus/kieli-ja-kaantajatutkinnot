import { CustomTextFieldErrors, TextFieldTypes } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { useAppSelector } from 'configs/redux';
import { YkiValidationErrors } from 'enums/app';
import {
  PublicFreeRegistrationDetails,
  UserDeclaredEducation,
} from 'interfaces/publicFreeRegistration';
import {
  PublicEmailRegistration,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { publicFreeRegistrationSelector } from 'redux/selectors/publicFreeRegistration';
import { registrationSelector } from 'redux/selectors/registration';
import { sessionSelector } from 'redux/selectors/session';
import { ExamSessionUtils } from 'utils/examSession';

type PublicRegistrationErrors = {
  [field in keyof Partial<
    PublicEmailRegistration &
      PublicSuomiFiRegistration &
      Omit<UserDeclaredEducation, 'source'>
  >]: string;
};

const getErrors = (
  showErrors: boolean,
  isEmailRegistration: boolean,
  registration: Partial<PublicEmailRegistration & PublicSuomiFiRegistration>,
  isEligibleForFreeRegistration: boolean,
  freeRegistrationDetails: PublicFreeRegistrationDetails,
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

  if (!registration.nationality) {
    errors['nationality'] = CustomTextFieldErrors.Required;
  }

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
  if (isEligibleForFreeRegistration) {
    const { isFree, basis } = freeRegistrationDetails;
    if (isFree === 'UNDECIDED') {
      if (!basis || basis.source === 'USER') {
        if (!basis?.countryOfEducation) {
          errors['countryOfEducation'] = CustomTextFieldErrors.Required;
        } else if (!basis?.educationType) {
          errors['educationType'] = CustomTextFieldErrors.Required;
        }
      }
    }
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
  const { loggedInSession } = useAppSelector(sessionSelector);
  const { examSession } = useAppSelector(examSessionSelector);
  const publicFreeRegistrationDetails = useAppSelector(
    publicFreeRegistrationSelector,
  );
  const { attemptsUsed } = publicFreeRegistrationDetails;
  const isEligibleForFreeRegistration =
    examSession &&
    ExamSessionUtils.freeRegistrationPossible(examSession, loggedInSession) &&
    (attemptsUsed || 0) < 3;

  return () =>
    getErrors(
      showErrors,
      isEmailRegistration as boolean,
      registration,
      !!isEligibleForFreeRegistration,
      publicFreeRegistrationDetails,
    );
};
