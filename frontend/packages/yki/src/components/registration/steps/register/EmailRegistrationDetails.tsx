import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ChangeEvent, useEffect } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomTextField,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  TextFieldTypes,
  TextFieldVariant,
} from 'shared/enums';
import { ComboBoxOption } from 'shared/interfaces';

import { PersonDetails } from 'components/registration/steps/register/PersonDetails';
import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { RadioButtonValue } from 'enums/app';
import { usePublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import { Nationality } from 'interfaces/nationality';
import { PublicEmailRegistration } from 'interfaces/publicRegistration';
import { loadNationalities } from 'redux/reducers/nationalities';
import { updatePublicRegistration } from 'redux/reducers/registration';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { registrationSelector } from 'redux/selectors/registration';

const ErrorLabelStyles = {
  '&.Mui-error .MuiFormControlLabel-label': {
    color: 'error.main',
  },
};

const nationalityToComboBoxOption = (
  nationality: Nationality
): ComboBoxOption => {
  return { label: nationality.name, value: nationality.code };
};

const useNationalityOptions = () => {
  const lang = getCurrentLang();
  const { nationalities } = useAppSelector(nationalitiesSelector);

  const options = [...nationalities]
    .filter((v) => v.language === lang)
    .map(nationalityToComboBoxOption);
  options.sort((a, b) => (a.label < b.label ? -1 : 1));

  return options;
};

export const EmailRegistrationDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const registration: Partial<PublicEmailRegistration> =
    useAppSelector(registrationSelector).registration;
  const { showErrors } = useAppSelector(registrationSelector);
  const { status: nationalitiesStatus, nationalities } = useAppSelector(
    nationalitiesSelector
  );
  const nationalityOptions = useNationalityOptions();
  const appLanguage = getCurrentLang();

  useEffect(() => {
    if (nationalitiesStatus === APIResponseStatus.NotStarted) {
      dispatch(loadNationalities());
    }
  }, [dispatch, nationalitiesStatus]);

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
          <ComboBox
            variant={TextFieldVariant.Outlined}
            values={nationalityOptions}
            value={
              registration.nationality
                ? nationalityToComboBoxOption(
                    nationalities.find(
                      ({ code, language }) =>
                        code === registration.nationality &&
                        language === appLanguage
                    ) as Nationality
                  )
                : null
            }
            onChange={(_, v: AutocompleteValue) => {
              dispatch(updatePublicRegistration({ nationality: v?.value }));
            }}
            label={`${t('nationality')} *`}
            aria-label={`${t('nationality')} *`}
            showError={showErrors && !!registrationErrors['nationality']}
            helperText={
              registrationErrors['nationality']
                ? translateCommon(registrationErrors['nationality'])
                : ''
            }
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
        <FormControl error={showErrors && !!registrationErrors['hasSSN']}>
          <RadioGroup row onChange={handleChange('hasSSN')}>
            <FormControlLabel
              className="radio-group-label"
              value={RadioButtonValue.YES}
              control={<Radio />}
              label={translateCommon('yes')}
              sx={ErrorLabelStyles}
            />
            <FormControlLabel
              className="radio-group-label"
              value={RadioButtonValue.NO}
              control={<Radio />}
              label={translateCommon('no')}
              sx={ErrorLabelStyles}
            />
          </RadioGroup>
          {registration.hasSSN && (
            <CustomTextField
              sx={{ width: 'calc(360px - 1rem)' }}
              {...getCustomTextFieldAttributes('ssn')}
              value={registration.ssn}
              type={TextFieldTypes.PersonalIdentityCode}
            />
          )}
        </FormControl>
      </div>
    </>
  );
};
