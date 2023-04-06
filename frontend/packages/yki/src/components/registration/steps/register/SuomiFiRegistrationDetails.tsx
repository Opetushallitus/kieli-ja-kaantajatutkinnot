import { ChangeEvent, useState } from 'react';
import { CustomTextField } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { PersonDetails } from 'components/registration/steps/register/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { usePublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import { PublicSuomiFiRegistration } from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';
import { registrationSelector } from 'redux/selectors/registration';

export const SuomiFiRegistrationDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const translateCommon = useCommonTranslation();

  const [fieldErrors, setFieldErrors] = useState({
    firstNames: '',
    lastName: '',
    email: '',
    emailConfirmation: '',
    phoneNumber: '',
    address: '',
    postNumber: '',
    postOffice: '',
    certificateLanguage: '',
    instructionLanguage: '',
    privacyStatementConfirmation: '',
    termsAndConditionsAgreed: '',
  });

  const dispatch = useAppDispatch();
  const registration: Partial<PublicSuomiFiRegistration> =
    useAppSelector(registrationSelector).registration;
  const { showErrors } = useAppSelector(registrationSelector);

  const handleChange =
    (fieldName: keyof Omit<PublicSuomiFiRegistration, 'id'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (fieldErrors[fieldName]) {
        handleErrors(fieldName)(event);
      }

      dispatch(
        updatePublicRegistration({
          [fieldName]: event.target.value,
        })
      );
    };

  const getRegistrationErrors = usePublicRegistrationErrors(showErrors);
  const registrationErrors = getRegistrationErrors();

  const handleErrors =
    (fieldName: keyof PublicSuomiFiRegistration) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { type, value, required } = event.target;

      const error = InputFieldUtils.inspectCustomTextFieldErrors(
        type as TextFieldTypes,
        value,
        required
      );

      const fieldErrorMessage = error ? translateCommon(error) : '';

      const emailConfirmationErrorMessage =
        registration.emailConfirmation &&
        registration.email !== registration.emailConfirmation
          ? t('mismatchingEmailsError')
          : '';

      setFieldErrors({
        ...fieldErrors,
        [fieldName]: fieldErrorMessage,
        ['emailConfirmation']: emailConfirmationErrorMessage,
      });
    };

  const showCustomTextFieldError = (
    fieldName: keyof Omit<PublicSuomiFiRegistration, 'id'>
  ) => {
    return fieldErrors[fieldName].length > 0;
  };

  // TODO Tried new error handling only for email. Generalize to other attributes as well!
  const getCustomTextFieldAttributes = (
    fieldName: keyof Omit<PublicSuomiFiRegistration, 'id'>
  ) => {
    if (fieldName === 'email') {
      return {
        id: `public-registration__contact-details__${fieldName}-field`,
        label: t(fieldName),
        onBlur: handleErrors(fieldName),
        onChange: handleChange(fieldName),
        error: showErrors,
        helperText: registrationErrors[fieldName]
          ? translateCommon(registrationErrors[fieldName] as string)
          : '',
        required: true,
        disabled: ['firstNames', 'lastName'].includes(fieldName),
      };
    } else {
      return {
        id: `public-registration__contact-details__${fieldName}-field`,
        label: t(fieldName),
        onBlur: handleErrors(fieldName),
        onChange: handleChange(fieldName),
        error: showCustomTextFieldError(fieldName),
        helperText: fieldErrors[fieldName],
        required: true,
        disabled: ['firstNames', 'lastName'].includes(fieldName),
      };
    }
  };

  return (
    <div className="registration-details rows gapped margin-top-sm">
      <PersonDetails
        getCustomTextFieldAttributes={getCustomTextFieldAttributes}
      />
      <div className="grid-columns gapped">
        <CustomTextField
          {...getCustomTextFieldAttributes('email')}
          type={TextFieldTypes.Email}
          value={registration.email}
        />
        <CustomTextField
          {...getCustomTextFieldAttributes('emailConfirmation')}
          type={TextFieldTypes.Email}
          value={registration.emailConfirmation}
          onPaste={(e) => {
            e.preventDefault();

            return false;
          }}
        />
      </div>
      <CustomTextField
        className="half-width-on-desktop"
        {...getCustomTextFieldAttributes('phoneNumber')}
        value={registration.phoneNumber}
        type={TextFieldTypes.PhoneNumber}
      />
    </div>
  );
};
