import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { ChangeEvent } from 'react';
import { CustomTextField, Text } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';

import { PersonDetails } from 'components/registration/steps/register/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { RadioButtonValue } from 'enums/app';
import { usePublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import { PublicEmailRegistration } from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';
import { registrationSelector } from 'redux/selectors/registration';

export const EmailRegistrationDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const registration: Partial<PublicEmailRegistration> =
    useAppSelector(registrationSelector).registration;
  const { showErrors } = useAppSelector(registrationSelector);

  const getRegistrationErrors = usePublicRegistrationErrors(showErrors);
  const registrationErrors = getRegistrationErrors();

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
      const value = getEventTargetValue(event.target.value);

      dispatch(
        updatePublicRegistration({
          [fieldName]: value,
        })
      );
    };

  const getCustomTextFieldAttributes = (
    fieldName: keyof Omit<PublicEmailRegistration, 'id'>
  ) => ({
    id: `public-registration__contact-details__${fieldName}-field`,
    label: t(fieldName),
    onChange: handleChange(fieldName),
    error: showErrors && !!registrationErrors[fieldName],
    helperText: registrationErrors[fieldName]
      ? translateCommon(registrationErrors[fieldName] as string)
      : '',
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
