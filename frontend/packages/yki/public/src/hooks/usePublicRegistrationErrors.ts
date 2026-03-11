import { CustomTextFieldErrors, TextFieldTypes } from 'shared/enums';
import { InputFieldUtils, StringUtils } from 'shared/utils';

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

export type PublicRegistrationErrors = {
  [field in keyof Partial<
    PublicEmailRegistration &
      PublicSuomiFiRegistration &
      Omit<UserDeclaredEducation, 'source'>
  >]: string;
};

const preferredNameSearchCollator = new Intl.Collator('fi-FI', {
  usage: 'search',
  sensitivity: 'base',
});

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
    maxLength: 100,
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
    maxLength: 50,
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
    let preferredNameError = InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.Text,
      required: true,
      value: registration.preferredName,
    });
    if (StringUtils.isBlankString(preferredNameError)) {
      // Preferred name must be one of first names.
      // However, in case of combined names, the preferred name can also be a part of those.
      // Thus, given the first name 'Ville-Pekka', possible preferred names are 'Ville', 'Pekka' and 'Ville-Pekka'.
      const firstNames = (registration.firstNames || '').split(/\s/);
      const candidates = firstNames.flatMap((v) => [v, ...v.split('-')]);
      const preferredName = registration.preferredName || '';
      const matchingName = candidates.find(
        (v) => preferredNameSearchCollator.compare(v, preferredName) === 0,
      );
      if (!matchingName) {
        preferredNameError = YkiValidationErrors.PreferredNameMustBeFirstName;
      }
    }
    errors['preferredName'] = preferredNameError;
    errors['lastName'] = InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.Text,
      required: true,
      value: registration.lastName,
    });
    if (!registration.nativeLanguage) {
      errors['nativeLanguage'] = CustomTextFieldErrors.Required;
    }
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
