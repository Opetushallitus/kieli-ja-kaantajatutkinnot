import { ChangeEvent, useState } from 'react';
import {
  AutocompleteValue,
  ComboBox,
  CustomSwitch,
  CustomTextField,
  H3,
} from 'shared/components';
import { TextFieldTypes, TextFieldVariant } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import {
  translateOutsideComponent,
  useAppTranslation,
  useCommonTranslation,
  useKoodistoCountriesTranslation,
} from 'configs/i18n';
import { ClerkTranslatorTextFieldEnum } from 'enums/clerkTranslator';
import {
  ClerkTranslatorBasicInformation,
  ClerkTranslatorTextFields,
} from 'interfaces/clerkTranslator';
import { ClerkTranslatorTextFieldProps } from 'interfaces/clerkTranslatorTextField';
import koodistoCountriesFI from 'public/i18n/koodisto/countries/koodisto_countries_fi-FI.json';

const getTextFieldType = (field: ClerkTranslatorTextFieldEnum) => {
  switch (field) {
    case ClerkTranslatorTextFieldEnum.PhoneNumber:
      return TextFieldTypes.PhoneNumber;
    case ClerkTranslatorTextFieldEnum.Email:
      return TextFieldTypes.Email;
    case ClerkTranslatorTextFieldEnum.ExtraInformation:
      return TextFieldTypes.Textarea;
    case ClerkTranslatorTextFieldEnum.IdentityNumber:
      return TextFieldTypes.PersonalIdentityCode;
    default:
      return TextFieldTypes.Text;
  }
};

const getFieldError = (
  translator: ClerkTranslatorBasicInformation | undefined,
  field: ClerkTranslatorTextFieldEnum
) => {
  const t = translateOutsideComponent();
  const type = getTextFieldType(field);
  const value = (translator && translator[field]) || '';
  const required =
    field == ClerkTranslatorTextFieldEnum.FirstName ||
    field == ClerkTranslatorTextFieldEnum.LastName;

  const error = InputFieldUtils.inspectCustomTextFieldErrors(
    type,
    value,
    required
  );

  return error ? t(`akr.${error}`) : '';
};

const ClerkTranslatorDetailsTextField = ({
  translator,
  field,
  onChange,
  displayError,
  ...rest
}: ClerkTranslatorTextFieldProps) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorOverview.translatorDetails.fields',
  });
  const fieldError = getFieldError(translator, field);

  return (
    <CustomTextField
      value={translator ? translator[field] : undefined}
      label={t(field)}
      onChange={onChange}
      type={getTextFieldType(field)}
      error={displayError && fieldError?.length > 0}
      helperText={fieldError}
      {...rest}
    />
  );
};

export const ClerkTranslatorDetailsFields = ({
  translator,
  onTextFieldChange,
  onComboBoxChange,
  onCheckBoxChange,
  editDisabled,
  topControlButtons,
  displayFieldErrorBeforeChange,
}: {
  translator?: ClerkTranslatorBasicInformation;
  onTextFieldChange: (
    field: keyof ClerkTranslatorTextFields
  ) => (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onComboBoxChange: (
    field: keyof ClerkTranslatorBasicInformation
  ) => ({}, autocompleteValue?: AutocompleteValue) => void;
  onCheckBoxChange: (
    field: keyof ClerkTranslatorBasicInformation
  ) => (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  editDisabled: boolean;
  topControlButtons?: JSX.Element;
  displayFieldErrorBeforeChange: boolean;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorOverview.translatorDetails',
  });
  const translateCommon = useCommonTranslation();
  const translateCountry = useKoodistoCountriesTranslation();

  const initialErrors = Object.values(ClerkTranslatorTextFieldEnum).reduce(
    (acc, val) => {
      return { ...acc, [val]: displayFieldErrorBeforeChange };
    },
    {}
  ) as Record<ClerkTranslatorTextFieldEnum, boolean>;

  const [displayFieldError, setDisplayFieldError] = useState(initialErrors);
  const displayFieldErrorOnBlur =
    (field: ClerkTranslatorTextFieldEnum) => () => {
      setDisplayFieldError({ ...displayFieldError, [field]: true });
    };

  const getCommonTextFieldProps = (field: ClerkTranslatorTextFieldEnum) => ({
    field,
    translator,
    disabled: editDisabled,
    onChange: onTextFieldChange(field),
    onBlur: displayFieldErrorOnBlur(field),
    displayError: displayFieldError[field],
    'data-testid': `clerk-translator__basic-information__${field}`,
  });

  const countryCodeToLabel = (code: string) => {
    const label = translateCountry(code);

    const labelKosovoFixedDuplicate =
      code === 'XKK' || code === 'XKX' ? `${label} ${code}` : label;

    return {
      label: labelKosovoFixedDuplicate,
      value: code,
    };
  };

  const comboBoxCountryValues: { label: string; value: string }[] = Object.keys(
    koodistoCountriesFI?.akr?.koodisto?.countries
  ).map(countryCodeToLabel);

  return (
    <>
      <div className="columns margin-top-lg">
        <div className="columns margin-top-lg grow">
          <H3>{t('header.personalInformation')}</H3>
        </div>
        {topControlButtons}
      </div>
      <div className="grid-columns gapped">
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(ClerkTranslatorTextFieldEnum.LastName)}
        />
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(ClerkTranslatorTextFieldEnum.FirstName)}
        />
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(
            ClerkTranslatorTextFieldEnum.IdentityNumber
          )}
        />
      </div>
      <H3>{t('header.address')}</H3>
      <div className="grid-columns gapped">
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(ClerkTranslatorTextFieldEnum.Street)}
        />
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(ClerkTranslatorTextFieldEnum.PostalCode)}
        />
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(ClerkTranslatorTextFieldEnum.Town)}
        />
        <ComboBox
          data-testid="clerk-translator__basic-information__country"
          autoHighlight
          disabled={editDisabled}
          label={t('fields.country')}
          variant={TextFieldVariant.Outlined}
          values={comboBoxCountryValues}
          value={
            translator?.country ? countryCodeToLabel(translator.country) : null
          }
          onChange={onComboBoxChange('country')}
        />
      </div>
      <H3>{t('header.contactInformation')}</H3>
      <div className="grid-columns gapped">
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(ClerkTranslatorTextFieldEnum.Email)}
        />
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(ClerkTranslatorTextFieldEnum.PhoneNumber)}
        />
      </div>
      <H3>{t('header.extraInformation')}</H3>
      <ClerkTranslatorDetailsTextField
        {...getCommonTextFieldProps(
          ClerkTranslatorTextFieldEnum.ExtraInformation
        )}
        multiline
        fullWidth
      />
      <div className="rows gapped-xs">
        <H3>{t('header.isAssuranceGiven')}</H3>
        <CustomSwitch
          dataTestId="clerk-translator__basic-information__assurance-switch"
          disabled={editDisabled}
          onChange={onCheckBoxChange('isAssuranceGiven')}
          value={translator?.isAssuranceGiven}
          leftLabel={translateCommon('no')}
          rightLabel={translateCommon('yes')}
          errorLabel={
            !translator?.isAssuranceGiven && t('caveats.isNotAssuranceGiven')
          }
        />
      </div>
    </>
  );
};
