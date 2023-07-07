import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ChangeEvent, useCallback } from 'react';
import {
  AutocompleteValue,
  LabeledComboBox,
  LabeledTextField,
  Text,
} from 'shared/components';
import {
  InputAutoComplete,
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
import { GenderEnum, RadioButtonValue } from 'enums/app';
import { usePublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import { Nationality } from 'interfaces/nationality';
import { PublicEmailRegistration } from 'interfaces/publicRegistration';
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
  const { nationalities } = useAppSelector(nationalitiesSelector);
  const nationalityOptions = useNationalityOptions();
  const appLanguage = getCurrentLang();

  const genderToComboBoxOption = useCallback(
    (gender: GenderEnum) => ({
      label: translateCommon(`gender.${gender}`) as string,
      value: gender,
    }),
    [translateCommon]
  );

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

  const getLabeledTextFieldAttributes = (
    fieldName: keyof Omit<PublicEmailRegistration, 'id'>
  ) => ({
    id: `public-registration__contact-details__${fieldName}-field`,
    label: t('labels.' + fieldName) + ' *',
    placeholder: t('placeholders.' + fieldName),
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
          getLabeledTextFieldAttributes={getLabeledTextFieldAttributes}
        />
        <div className="grid-columns gapped">
          <LabeledTextField
            {...getLabeledTextFieldAttributes('phoneNumber')}
            value={registration.phoneNumber}
            type={TextFieldTypes.PhoneNumber}
            autoComplete={InputAutoComplete.PhoneNumber}
          />
          <LabeledTextField
            {...getLabeledTextFieldAttributes('email')}
            type={TextFieldTypes.Email}
            value={registration.email}
            disabled={true}
            autoComplete={InputAutoComplete.Email}
          />
        </div>
        <div className="grid-columns gapped">
          <LabeledComboBox
            id="public-registration__contact-details__nationality-field"
            label={`${t('labels.nationality')} *`}
            aria-label={`${t('labels.nationality')} *`}
            placeholder={t('placeholders.nationality')}
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
            showError={showErrors && !!registrationErrors['nationality']}
            helperText={
              registrationErrors['nationality']
                ? translateCommon(registrationErrors['nationality'])
                : ''
            }
          />
          <LabeledTextField
            {...getLabeledTextFieldAttributes('dateOfBirth')}
            type={TextFieldTypes.Text}
            value={registration.dateOfBirth}
          />
        </div>
        <LabeledComboBox
          id="public-registration__contact-gender-field"
          label={t('labels.gender')}
          aria-label={t('labels.gender')}
          placeholder={t('placeholders.gender')}
          className="half-width-on-desktop"
          variant={TextFieldVariant.Outlined}
          values={[
            ...Object.values(GenderEnum).map(genderToComboBoxOption),
          ].sort((a, b) => a.label.localeCompare(b.label))}
          value={
            registration.gender
              ? genderToComboBoxOption(registration.gender)
              : null
          }
          onChange={(_, v: AutocompleteValue) => {
            dispatch(
              updatePublicRegistration({ gender: v?.value as GenderEnum })
            );
          }}
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
            <LabeledTextField
              sx={{ width: 'calc(360px - 1rem)' }}
              {...getLabeledTextFieldAttributes('ssn')}
              value={registration.ssn}
              type={TextFieldTypes.PersonalIdentityCode}
            />
          )}
        </FormControl>
      </div>
    </>
  );
};
