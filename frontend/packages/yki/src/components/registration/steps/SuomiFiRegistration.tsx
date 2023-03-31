import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Checkbox, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { CustomTextField, ExtLink, H2, Text } from 'shared/components';
import { Color, TextFieldTypes } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { PersonDetails } from 'components/registration/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { CertificateLanguage } from 'enums/app';
import {
  PublicSuomiFiRegistration,
  RegistrationCheckboxDetails,
} from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';

export const SuomiFiRegistration = ({
  registration,
}: {
  registration: PublicSuomiFiRegistration;
}) => {
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
    privacyStatementConfirmation: '',
    certificateLanguage: '',
    termsAndConditionsAgreed: '',
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

  const getCustomTextFieldAttributes = (
    fieldName: keyof Omit<PublicSuomiFiRegistration, 'id'>
  ) => {
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
  };

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

      <H2>{t('whatsNext.title')}</H2>
      <Text>{t('whatsNext.description1')}</Text>
      <Text>
        {t('whatsNext.description2')}
        <br />
        {t('whatsNext.description3')}:
        <br />
        <ExtLink
          className="text-embed-link text-transform-none"
          href={'endpoint'}
          text={t('whatsNext.linkLabel')}
          endIcon={<OpenInNewIcon />}
        />
      </Text>
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
          />
        }
        label={t('termsAndConditions.label')}
        className="public-registration__grid__preview__privacy-statement-checkbox-label"
      />
      <Text>
        {t('privacyStatement.description')}:
        <br />
        <ExtLink
          className="text-embed-link text-transform-none"
          href={'endpoint'}
          text={t('privacyStatement.linkLabel')}
          endIcon={<OpenInNewIcon />}
        />
      </Text>
      <FormControlLabel
        control={
          <Checkbox
            onClick={() => handleCheckboxClick('privacyStatementConfirmation')}
            color={Color.Secondary}
            checked={registration.privacyStatementConfirmation}
          />
        }
        label={t('privacyStatement.label')}
        className="public-registration__grid__preview__privacy-statement-checkbox-label"
      />
    </div>
  );
};
