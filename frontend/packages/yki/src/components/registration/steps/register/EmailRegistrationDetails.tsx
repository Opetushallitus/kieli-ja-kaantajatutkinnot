import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { CustomTextField, Text } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { PersonDetails } from 'components/registration/steps/register/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { RadioButtonValue } from 'enums/app';
import { PublicEmailRegistration } from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';
import { registrationSelector } from 'redux/selectors/registration';

export const EmailRegistrationDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
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
    gender: '',
    hasSSN: '',
    ssn: '',
  });

  const dispatch = useAppDispatch();
  const registration: Partial<PublicEmailRegistration> =
    useAppSelector(registrationSelector).registration;

  const getEventTargetValue = (value: string) => {
    if (value === (RadioButtonValue.YES as string)) {
      return true;
    } else if (value === (RadioButtonValue.NO as string)) {
      return false;
    }

    return value;
  };

  const handleChange =
    (fieldName: keyof Omit<PublicEmailRegistration, 'id'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (fieldErrors[fieldName]) {
        handleErrors(fieldName)(event);
      }

      const value = getEventTargetValue(event.target.value);

      dispatch(
        updatePublicRegistration({
          [fieldName]: value,
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
    fieldName: keyof Omit<PublicEmailRegistration, 'id'>
  ) => {
    return fieldErrors[fieldName].length > 0;
  };

  const getCustomTextFieldAttributes = (
    fieldName: keyof Omit<PublicEmailRegistration, 'id'>
  ) => ({
    id: `public-registration__contact-details__${fieldName}-field`,
    label: t(fieldName),
    onBlur: handleErrors(fieldName),
    onChange: handleChange(fieldName),
    error: showCustomTextFieldError(fieldName),
    helperText: fieldErrors[fieldName],
    required: true,
  });

  return (
    <>
      <div className="registration-details rows gapped margin-top-sm">
        <PersonDetails
          getCustomTextFieldAttributes={getCustomTextFieldAttributes}
        />
        <div className="grid-columns gapped">
          <CustomTextField
            {...getCustomTextFieldAttributes('phoneNumber')}
            value={registration.phoneNumber}
            type={TextFieldTypes.PhoneNumber}
          />
          <CustomTextField
            {...getCustomTextFieldAttributes('email')}
            type={TextFieldTypes.Email}
            value={registration.email}
            disabled={true}
          />
        </div>
        <div className="grid-columns gapped">
          <CustomTextField
            {...getCustomTextFieldAttributes('nationality')}
            value={registration.nationality}
            type={TextFieldTypes.Text}
          />
          <CustomTextField
            {...getCustomTextFieldAttributes('dateOfBirth')}
            type={TextFieldTypes.Text}
            value={registration.dateOfBirth}
          />
        </div>
        <CustomTextField
          className="half-width-on-desktop"
          {...getCustomTextFieldAttributes('gender')}
          type={TextFieldTypes.Text}
          value={registration.gender}
        />
      </div>
      <div>
        <Text>
          <b>{t('finnishSSN')}</b>
        </Text>
        <RadioGroup row onChange={handleChange('hasSSN')}>
          <FormControlLabel
            className="radio-group-label"
            value={RadioButtonValue.YES}
            control={<Radio />}
            label={translateCommon('yes')}
          />
          <FormControlLabel
            className="radio-group-label"
            value={RadioButtonValue.NO}
            control={<Radio />}
            label={translateCommon('no')}
          />
        </RadioGroup>
        {registration.hasSSN && (
          <CustomTextField
            sx={{ width: 'calc(360px - 1rem)' }}
            {...getCustomTextFieldAttributes('ssn')}
            value={registration.ssn}
            type={TextFieldTypes.Text}
          />
        )}
      </div>
    </>
  );
};
