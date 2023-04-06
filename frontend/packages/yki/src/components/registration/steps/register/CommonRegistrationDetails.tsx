import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ChangeEvent } from 'react';
import { H2, Text } from 'shared/components';
import { Color } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { CertificateLanguage } from 'enums/app';
import { usePublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import {
  PersonFillOutDetails,
  RegistrationCheckboxDetails,
} from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';
import { registrationSelector } from 'redux/selectors/registration';

const ErrorLabelStyles = {
  '&.Mui-error .MuiFormControlLabel-label': {
    color: 'error.main',
  },
};

export const CommonRegistrationDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const translateCommon = useCommonTranslation();

  const { registration, showErrors } = useAppSelector(registrationSelector);
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
  const handleChange = (fieldname: keyof PersonFillOutDetails) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(updatePublicRegistration({ [fieldname]: event.target.value }));
    };
  };

  const getRegistrationErrors = usePublicRegistrationErrors(showErrors);
  const registrationErrors = getRegistrationErrors();

  return (
    <>
      <div>
        <Text>
          <b>{t('certificateLanguage')}</b>
        </Text>
        <FormControl error={!!registrationErrors['certificateLanguage']}>
          <RadioGroup row onChange={handleChange('certificateLanguage')}>
            <FormControlLabel
              className="radio-group-label"
              value={CertificateLanguage.FI}
              control={<Radio />}
              label={translateCommon('languages.fin')}
              sx={ErrorLabelStyles}
            />
            <FormControlLabel
              className="radio-group-label"
              value={CertificateLanguage.SV}
              control={<Radio />}
              label={translateCommon('languages.swe')}
              sx={ErrorLabelStyles}
            />
            <FormControlLabel
              className="radio-group-label"
              value={CertificateLanguage.EN}
              control={<Radio />}
              label={translateCommon('languages.eng')}
              sx={ErrorLabelStyles}
            />
          </RadioGroup>
        </FormControl>
      </div>
      <H2>{t('termsAndConditions.title')}</H2>
      <Text>
        <b>{t('termsAndConditions.description1')}</b>
        <br />
        <b>{t('termsAndConditions.description2')}</b>
        <br />
        {t('termsAndConditions.description3')}
      </Text>
      <FormControl error={!!registrationErrors['termsAndConditionsAgreed']}>
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
          sx={ErrorLabelStyles}
        />
      </FormControl>
      <div>
        <Text>{t('privacyStatement.description')}:</Text>
        <div className="columns gapped-xxs">
          <Link href={translateCommon('privacyStatementLink')} target="_blank">
            <Text>{t('privacyStatement.linkLabel')}</Text>
          </Link>
          <OpenInNewIcon />
        </div>
      </div>
      <FormControl error={!!registrationErrors['privacyStatementConfirmation']}>
        <FormControlLabel
          control={
            <Checkbox
              onClick={() =>
                handleCheckboxClick('privacyStatementConfirmation')
              }
              color={Color.Secondary}
              checked={registration.privacyStatementConfirmation}
            />
          }
          label={t('privacyStatement.label')}
          className="public-registration__grid__preview__privacy-statement-checkbox-label"
          sx={ErrorLabelStyles}
        />
      </FormControl>
    </>
  );
};
