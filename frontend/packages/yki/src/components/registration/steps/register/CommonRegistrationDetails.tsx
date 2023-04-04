import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Checkbox,
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
import {
  PersonFillOutDetails,
  RegistrationCheckboxDetails,
} from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';
import { registrationSelector } from 'redux/selectors/registration';

export const CommonRegistrationDetails = ({}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const translateCommon = useCommonTranslation();

  const { registration } = useAppSelector(registrationSelector);
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

  // TODO Wrap FormControlLabels in <FormControl error={error}> .. </FormControl>

  return (
    <>
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
          />
        }
        label={t('privacyStatement.label')}
        className="public-registration__grid__preview__privacy-statement-checkbox-label"
      />
    </>
  );
};
