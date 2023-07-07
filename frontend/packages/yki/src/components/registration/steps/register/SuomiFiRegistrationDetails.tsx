import { ChangeEvent } from 'react';
import {
  AutocompleteValue,
  LabeledComboBox,
  LabeledTextField,
  Text,
} from 'shared/components';
import { TextFieldTypes, TextFieldVariant } from 'shared/enums';

import { AddressDetails } from 'components/registration/steps/register/AddressDetails';
import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { useNationalityOptions } from 'hooks/useNationalityOptions';
import { usePublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import { Nationality } from 'interfaces/nationality';
import {
  PublicEmailRegistration,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { registrationSelector } from 'redux/selectors/registration';
import { nationalityToComboBoxOption } from 'utils/autocomplete';

export const SuomiFiRegistrationDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const translateCommon = useCommonTranslation();
  const appLanguage = getCurrentLang();

  const dispatch = useAppDispatch();
  const registration: Partial<
    PublicSuomiFiRegistration & PublicEmailRegistration
  > = useAppSelector(registrationSelector).registration;
  const { showErrors, hasSuomiFiNationalityData } =
    useAppSelector(registrationSelector);
  const nationalities = useAppSelector(nationalitiesSelector).nationalities;
  const nationalityOptions = useNationalityOptions();

  const handleChange =
    (fieldName: keyof Omit<PublicSuomiFiRegistration, 'id'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        updatePublicRegistration({
          [fieldName]: event.target.value,
        })
      );
    };

  const getRegistrationErrors = usePublicRegistrationErrors(showErrors);
  const registrationErrors = getRegistrationErrors();

  const getLabeledTextFieldAttributes = (
    fieldName: keyof Omit<PublicSuomiFiRegistration, 'id'>
  ) => {
    return {
      id: `public-registration__contact-details__${fieldName}-field`,
      label: t('labels.' + fieldName) + ' *',
      placeholder: t('placeholders.' + fieldName),
      onChange: handleChange(fieldName),
      error: showErrors && !!registrationErrors[fieldName],
      helperText: registrationErrors[fieldName]
        ? translateCommon(registrationErrors[fieldName] as string)
        : '',
      required: true,
      disabled: false,
    };
  };

  return (
    <div className="registration-details rows gapped margin-top-sm">
      <div className="columns gapped">
        <Text className="half-width-on-desktop flex-grow-1">
          <b>{t('labels.firstNames')}</b>
          <br />
          {registration.firstNames}
        </Text>
        <Text className="half-width-on-desktop flex-grow-1">
          <b>{t('labels.lastName')}</b>
          <br />
          {registration.lastName}
        </Text>
      </div>
      <div className="columns gapped">
        <Text>
          <b>{t('labels.ssn')}</b>
          <br />
          {registration.ssn}
        </Text>
      </div>
      <AddressDetails
        getLabeledTextFieldAttributes={getLabeledTextFieldAttributes}
      />
      <div className="grid-columns gapped">
        <LabeledTextField
          {...getLabeledTextFieldAttributes('email')}
          type={TextFieldTypes.Email}
          value={registration.email || ''}
        />
        <LabeledTextField
          {...getLabeledTextFieldAttributes('emailConfirmation')}
          type={TextFieldTypes.Email}
          value={registration.emailConfirmation || ''}
          onPaste={(e) => {
            e.preventDefault();

            return false;
          }}
        />
      </div>
      <LabeledTextField
        className="half-width-on-desktop"
        {...getLabeledTextFieldAttributes('phoneNumber')}
        value={registration.phoneNumber || ''}
        type={TextFieldTypes.PhoneNumber}
      />
      {!hasSuomiFiNationalityData && (
        <LabeledComboBox
          id="public-registration__contact-details__nationality-field"
          className="half-width-on-desktop"
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
      )}
    </div>
  );
};
