import { Checkbox, FormControlLabel } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { Namespace, TFunction } from 'react-i18next';
import { CustomTextField, H3, Text } from 'shared/components';
import { AppLanguage, Color, TextFieldTypes } from 'shared/enums';
import { InputFieldUtils, StringUtils } from 'shared/utils';

import { PrivacyStatementCheckboxLabel } from 'components/registration/PrivacyStatementCheckboxLabel';
import { PersonDetails } from 'components/registration/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import {
  PublicSuomiFiRegistration,
  RegistrationCheckboxDetails,
} from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/examSession';

export const FillContactDetails = ({
  registration,
  isLoading,
  disableNext,
}: {
  registration: PublicSuomiFiRegistration;
  isLoading: boolean;
  disableNext: (disabled: boolean) => void;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.register',
  });
  const { t: tPerson } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.personDetails',
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
    privacyStatementConfirmation: '',
    certificateLanguage: '',
    termsAndConditionsAgreed: '',
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    const hasFieldErrors = !!(fieldErrors.email || fieldErrors.phoneNumber);

    const hasBlankFieldValues = [
      registration.email,
      registration.phoneNumber,
    ].some(StringUtils.isBlankString);
    const mismatchingEmails =
      registration.email !== registration.emailConfirmation;

    disableNext(hasFieldErrors || hasBlankFieldValues || mismatchingEmails);
  }, [fieldErrors, disableNext, registration]);

  const handleCheckboxClick = (
    fieldName: keyof RegistrationCheckboxDetails
  ) => {
    dispatch(
      updatePublicRegistration({
        [fieldName]: !registration[fieldName],
      })
    );
  };

  const handleChange =
    (fieldName: keyof PublicSuomiFiRegistration) =>
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
    fieldName: keyof PublicSuomiFiRegistration
  ) => {
    return fieldErrors[fieldName].length > 0;
  };

  const getCustomTextFieldAttributes =
    (translate: TFunction<Namespace<AppLanguage>, string>) =>
    (fieldName: keyof PublicSuomiFiRegistration) => {
      return {
        id: `public-registration__contact-details__${fieldName}-field`,
        label: translate(fieldName),
        onBlur: handleErrors(fieldName),
        onChange: handleChange(fieldName),
        error: showCustomTextFieldError(fieldName),
        helperText: fieldErrors[fieldName],
        required: true,
        disabled: isLoading || ['firstNames', 'lastName'].includes(fieldName),
      };
    };

  return (
    <div className="margin-top-xxl rows gapped">
      <PersonDetails
        getCustomTextFieldAttributes={getCustomTextFieldAttributes(tPerson)}
      />
      <div className="margin-top-sm rows gapped">
        <H3>{t('title')}</H3>
        <div className="grid-columns gapped">
          <CustomTextField
            {...getCustomTextFieldAttributes(t)('email')}
            type={TextFieldTypes.Email}
            value={registration.email}
          />
          <CustomTextField
            {...getCustomTextFieldAttributes(t)('emailConfirmation')}
            type={TextFieldTypes.Email}
            value={registration.emailConfirmation}
            onPaste={(e) => {
              e.preventDefault();

              return false;
            }}
          />
        </div>
      </div>
      <CustomTextField
        {...getCustomTextFieldAttributes(t)('phoneNumber')}
        className="phone-number"
        value={registration.phoneNumber}
        type={TextFieldTypes.PhoneNumber}
      />
      <Text>
        <b>{t('termsAndConditions.title')}</b>
      </Text>
      <Text>{t('termsAndConditions.description')}</Text>
      <FormControlLabel
        control={
          <Checkbox
            onClick={() => handleCheckboxClick('termsAndConditionsAgreed')}
            color={Color.Secondary}
            checked={registration.termsAndConditionsAgreed}
            disabled={isLoading}
          />
        }
        label={t('termsAndConditions.label')}
        className="public-registration__grid__preview__privacy-statement-checkbox-label"
      />
      <FormControlLabel
        control={
          <Checkbox
            onClick={() => handleCheckboxClick('privacyStatementConfirmation')}
            color={Color.Secondary}
            checked={registration.privacyStatementConfirmation}
            disabled={isLoading}
          />
        }
        label={<PrivacyStatementCheckboxLabel />}
        className="public-registration__grid__preview__privacy-statement-checkbox-label"
      />
    </div>
  );
};
