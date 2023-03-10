import { Checkbox, FormControlLabel } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { CustomTextField, Text } from 'shared/components';
import { Color, TextFieldTypes } from 'shared/enums';
import { InputFieldUtils, StringUtils } from 'shared/utils';

import { PrivacyStatementCheckboxLabel } from 'components/registration/PrivacyStatementCheckboxLabel';
import { PersonDetails } from 'components/registration/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import {
  PublicEmailRegistration,
  RegistrationCheckboxDetails,
} from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/examSession';

export const EmailRegistrationFillContactDetails = ({
  registration,
  isLoading,
  disableNext,
}: {
  registration: PublicEmailRegistration;
  isLoading: boolean;
  disableNext: (disabled: boolean) => void;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.register',
  });
  const translateCommon = useCommonTranslation();

  const [fieldErrors, setFieldErrors] = useState({
    firstNames: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    address: '',
    postNumber: '',
    postOffice: '',
    privacyStatementConfirmation: '',
    certificateLanguage: '',
    termsAndConditionsAgreed: '',
    nationality: '',
    dateOfBirth: '',
    sex: '',
    hasSSN: '',
    ssn: '',
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    const hasFieldErrors = !!(
      fieldErrors.firstNames ||
      fieldErrors.lastName ||
      fieldErrors.address ||
      fieldErrors.postNumber ||
      fieldErrors.postOffice ||
      fieldErrors.email ||
      fieldErrors.phoneNumber ||
      fieldErrors.nationality ||
      fieldErrors.dateOfBirth ||
      fieldErrors.sex
    );

    const ssnError =
      registration.hasSSN === undefined ||
      (registration.hasSSN && StringUtils.isBlankString(registration.ssn));

    const hasBlankFieldValues = [
      registration.email,
      registration.phoneNumber,
    ].some(StringUtils.isBlankString);

    disableNext(hasFieldErrors || hasBlankFieldValues || ssnError);
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
    (fieldName: keyof PublicEmailRegistration) =>
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
    (fieldName: keyof PublicEmailRegistration) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { type, value, required } = event.target;

      const error = InputFieldUtils.inspectCustomTextFieldErrors(
        type as TextFieldTypes,
        value,
        required
      );

      const fieldErrorMessage = error ? translateCommon(error) : '';

      setFieldErrors({
        ...fieldErrors,
        [fieldName]: fieldErrorMessage,
      });
    };

  const showCustomTextFieldError = (
    fieldName: keyof PublicEmailRegistration
  ) => {
    return fieldErrors[fieldName].length > 0;
  };

  const getCustomTextFieldAttributes = (
    fieldName: keyof PublicEmailRegistration
  ) => ({
    id: `public-registration__contact-details__${fieldName}-field`,
    label: t(fieldName),
    onBlur: handleErrors(fieldName),
    onChange: handleChange(fieldName),
    error: showCustomTextFieldError(fieldName),
    helperText: fieldErrors[fieldName],
    required: true,
    disabled: isLoading,
  });

  return (
    <div className="margin-top-xxl rows gapped">
      <PersonDetails
        getCustomTextFieldAttributes={getCustomTextFieldAttributes}
      />
      <CustomTextField
        {...getCustomTextFieldAttributes('phoneNumber')}
        className="phone-number"
        value={registration.phoneNumber}
        type={TextFieldTypes.PhoneNumber}
      />
      <Text>
        <b>{t('preview.termsAndConditions.title')}</b>
      </Text>
      <Text>{t('preview.termsAndConditions.description')}</Text>
      <FormControlLabel
        control={
          <Checkbox
            onClick={() => handleCheckboxClick('termsAndConditionsAgreed')}
            color={Color.Secondary}
            checked={registration.termsAndConditionsAgreed}
            disabled={isLoading}
          />
        }
        label={t('preview.termsAndConditions.label')}
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
