import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Checkbox,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { CustomTextField, H2, Text } from 'shared/components';
import { Color, TextFieldTypes } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { PersonDetails } from 'components/registration/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { CertificateLanguage, RadioButtonValue } from 'enums/app';
import {
  PublicEmailRegistration,
  RegistrationCheckboxDetails,
} from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';

export const EmailRegistration = ({
  registration,
  isLoading,
}: {
  registration: PublicEmailRegistration;
  isLoading: boolean;
}) => {
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

  const handleCheckboxClick = (
    fieldName: keyof RegistrationCheckboxDetails
  ) => {
    dispatch(
      updatePublicRegistration({
        [fieldName]: !registration[fieldName],
      })
    );
  };

  const getEventTargetValue = (value: string) => {
    if (value === (RadioButtonValue.YES as string)) {
      return true;
    } else if (value === (RadioButtonValue.NO as string)) {
      return false;
    }

    return value;
  };

  const handleChange =
    (fieldName: keyof PublicEmailRegistration) =>
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
      <H2>{t('title')}</H2>
      <Text>
        {t('description1')}
        <br />
        {t('description2')}
      </Text>
      <div className="email-registration-details rows gapped margin-top-sm">
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
      <div>
        <Text>
          <b>{t('certificateLanguage')}</b>
        </Text>
        <RadioGroup row onChange={handleChange('certificateLanguage')}>
          <FormControlLabel
            className="radio-group-label"
            value={CertificateLanguage.FI}
            control={<Radio />}
            label={translateCommon('languages.fin')}
          />
          <FormControlLabel
            className="radio-group-label"
            value={CertificateLanguage.SV}
            control={<Radio />}
            label={translateCommon('languages.swe')}
          />
          <FormControlLabel
            className="radio-group-label"
            value={CertificateLanguage.EN}
            control={<Radio />}
            label={translateCommon('languages.eng')}
          />
        </RadioGroup>
      </div>

      <H2>{t('termsAndConditions.title')}</H2>
      <Text>
        <b>{t('termsAndConditions.description1')}</b>
        <br />
        <b>{t('termsAndConditions.description2')}</b>
        <br />
        {t('termsAndConditions.description3')}
      </Text>
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
      <div>
        <Text>{t('privacyStatement.description')}:</Text>
        <div className="columns gapped-xxs">
          <Link href={translateCommon('privacyStatementLink')} target="_blank">
            <Text>{t('privacyStatement.linkLabel')}</Text>
          </Link>
          <OpenInNewIcon />
        </div>
      </div>
      <FormControlLabel
        control={
          <Checkbox
            onClick={() => handleCheckboxClick('privacyStatementConfirmation')}
            color={Color.Secondary}
            checked={registration.privacyStatementConfirmation}
            disabled={isLoading}
          />
        }
        label={t('privacyStatement.label')}
        className="public-registration__grid__preview__privacy-statement-checkbox-label"
      />
      <H2>{t('whatsNext.title')}</H2>
      <Text>{t('whatsNext.description1')}</Text>
      <Text>
        {t('whatsNext.description2')}
        <br />
        {t('whatsNext.description3')}:
        <br />
        <div className="columns gapped-xxs">
          <Link
            href={translateCommon('specialArrangementsLink')}
            target="_blank"
          >
            {t('whatsNext.linkLabel')}
          </Link>
          <OpenInNewIcon />
        </div>
      </Text>
    </div>
  );
};
