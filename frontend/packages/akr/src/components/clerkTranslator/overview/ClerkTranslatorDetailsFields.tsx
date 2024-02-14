import { Add as AddIcon } from '@mui/icons-material';
import { FormHelperTextProps } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import {
  //ComboBox,
  CustomButton,
  CustomSwitch,
  CustomTextField,
  H3,
  InfoText,
} from 'shared/components';
import {
  Color,
  TextFieldTypes /*TextFieldVariant*/,
  Variant,
} from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import {
  ClerkTranslatorAddressFields,
  ClerkTranslatorAddressModal,
  ClerkTranslatorPrimaryAddress,
} from 'components/clerkTranslator/overview/ClerkTranslatorAddressFields';
import {
  translateOutsideComponent,
  useAppTranslation,
  useCommonTranslation,
  //useKoodistoCountriesTranslation,
} from 'configs/i18n';
import {
  ClerkTranslatorAddressFieldEnum,
  ClerkTranslatorTextFieldEnum,
} from 'enums/clerkTranslator';
import {
  ClerkTranslatorAddress,
  ClerkTranslatorBasicInformation,
  ClerkTranslatorTextFields,
} from 'interfaces/clerkTranslator';
import { ClerkTranslatorTextFieldProps } from 'interfaces/clerkTranslatorTextField';
//import koodistoCountriesFI from 'public/i18n/koodisto/countries/koodisto_countries_fi-FI.json';

const textFieldMaxLengths = {
  [ClerkTranslatorTextFieldEnum.IdentityNumber]: 255,
  [ClerkTranslatorTextFieldEnum.LastName]: 255,
  [ClerkTranslatorTextFieldEnum.FirstName]: 255,
  [ClerkTranslatorTextFieldEnum.NickName]: 255,
  [ClerkTranslatorTextFieldEnum.Email]: 255,
  [ClerkTranslatorTextFieldEnum.PhoneNumber]: 255,
  [ClerkTranslatorTextFieldEnum.ExtraInformation]: 4096,
};

const getTextFieldMaxLength = (field: ClerkTranslatorTextFieldEnum) => {
  return textFieldMaxLengths[field] ?? null;
};

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
  field: ClerkTranslatorTextFieldEnum,
  required: boolean,
) => {
  const t = translateOutsideComponent();
  const type = getTextFieldType(field);
  const maxLength = getTextFieldMaxLength(field);
  const value = (translator && translator[field]) || '';

  const error = InputFieldUtils.inspectCustomTextFieldErrors(
    type,
    value,
    required,
    maxLength,
  );

  return error ? t(`akr.${error}`) : '';
};

const getHelperText = (isRequiredFieldError: boolean, fieldError: string) =>
  isRequiredFieldError ? fieldError : <InfoText>{fieldError}</InfoText>;

const ClerkTranslatorDetailsTextField = ({
  translator,
  field,
  onChange,
  showFieldError,
  ...rest
}: ClerkTranslatorTextFieldProps) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorOverview.translatorDetails.fields',
  });
  const required =
    field == ClerkTranslatorTextFieldEnum.FirstName ||
    field == ClerkTranslatorTextFieldEnum.LastName ||
    field == ClerkTranslatorTextFieldEnum.NickName;
  const fieldError = getFieldError(translator, field, required);
  const showRequiredFieldError =
    showFieldError && fieldError?.length > 0 && required;
  const showHelperText =
    (showFieldError || !required) && fieldError?.length > 0;

  return (
    <CustomTextField
      value={translator ? translator[field] : undefined}
      label={t(field)}
      onChange={onChange}
      type={getTextFieldType(field)}
      FormHelperTextProps={{ component: 'div' } as FormHelperTextProps}
      error={showRequiredFieldError}
      showHelperText={showHelperText}
      helperText={getHelperText(showRequiredFieldError, fieldError)}
      {...rest}
    />
  );
};

export const ClerkTranslatorDetailsFields = ({
  translator,
  isPersonalInformationIndividualised,
  isAddressIndividualised,
  onTextFieldChange,
  onAddressChange,
  onCheckBoxChange,
  editDisabled,
  topControlButtons,
  showFieldErrorBeforeChange,
}: {
  translator?: ClerkTranslatorBasicInformation;
  isPersonalInformationIndividualised?: boolean;
  isAddressIndividualised?: boolean;
  onTextFieldChange: (
    field: keyof ClerkTranslatorTextFields,
  ) => (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onAddressChange: (addresses: Array<ClerkTranslatorAddress>) => void;
  onCheckBoxChange: (
    field: keyof ClerkTranslatorBasicInformation,
  ) => (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  editDisabled: boolean;
  topControlButtons?: JSX.Element;
  showFieldErrorBeforeChange: boolean;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorOverview.translatorDetails',
  });
  const translateCommon = useCommonTranslation();
  // TODO: M.S. poista tarpeettomiksi jääneet useKoodistoCountriesTranslation()
  //const translateCountry = useKoodistoCountriesTranslation();

  const [open, setOpen] = useState(false);
  const initialFieldErrors = Object.assign(
    Object.values(ClerkTranslatorTextFieldEnum),
    Object.values(ClerkTranslatorAddressFieldEnum),
  ).reduce((acc, val) => {
    return { ...acc, [val]: showFieldErrorBeforeChange };
  }, {}) as Record<
    ClerkTranslatorTextFieldEnum | ClerkTranslatorAddressFieldEnum,
    boolean
  >;

  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const setFieldErrorOnBlur =
    (field: ClerkTranslatorTextFieldEnum | ClerkTranslatorAddressFieldEnum) =>
    () => {
      setFieldErrors((prevFieldErrors) => ({
        ...prevFieldErrors,
        [field]: true,
      }));
    };

  const isIndividualisedValue = (field: ClerkTranslatorTextFieldEnum) => {
    const isIdentityNumberField =
      field === ClerkTranslatorTextFieldEnum.IdentityNumber;

    const isIndividualisedPersonalInformationField =
      isPersonalInformationIndividualised &&
      [
        ClerkTranslatorTextFieldEnum.LastName,
        ClerkTranslatorTextFieldEnum.FirstName,
        ClerkTranslatorTextFieldEnum.NickName,
      ].includes(field);

    return isIdentityNumberField || isIndividualisedPersonalInformationField;
  };

  const onAddressFieldChange = (e: ChangeEvent<HTMLTextAreaElement>) => {};

  const getCommonTextFieldProps = (field: ClerkTranslatorTextFieldEnum) => {
    return {
      field,
      translator,
      disabled: editDisabled || isIndividualisedValue(field),
      onChange: onTextFieldChange(field),
      showFieldError: fieldErrors[field],
      onBlur: setFieldErrorOnBlur(field),
      fullWidth: true,
      'data-testid': `clerk-translator__basic-information__${field}`,
    };
  };

  // const countryCodeToLabel = (code: string) => {
  //   const label = translateCountry(code);

  //   const labelKosovoFixedDuplicate =
  //     code === 'XKK' || code === 'XKX' ? `${label} ${code}` : label;

  //   return {
  //     label: labelKosovoFixedDuplicate,
  //     value: code,
  //   };
  // };

  // const comboBoxCountryValues: { label: string; value: string }[] = Object.keys(
  //   koodistoCountriesFI?.akr?.koodisto?.countries
  // ).map(countryCodeToLabel);

  return (
    <>
      <div className="columns margin-top-lg">
        <div className="columns margin-top-lg grow">
          <H3 className="margin-right-xs">{t('header.personalInformation')}</H3>
          {isPersonalInformationIndividualised && (
            <div className="individualised">
              <InfoText>{t('individualisedInformation')}</InfoText>
            </div>
          )}
        </div>
        {topControlButtons}
      </div>
      <div className="columns align-items-start gapped">
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(ClerkTranslatorTextFieldEnum.LastName)}
        />
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(ClerkTranslatorTextFieldEnum.FirstName)}
        />
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(ClerkTranslatorTextFieldEnum.NickName)}
        />
        <ClerkTranslatorDetailsTextField
          {...getCommonTextFieldProps(
            ClerkTranslatorTextFieldEnum.IdentityNumber,
          )}
        />
      </div>
      <H3>{t('header.address')}</H3>
      {isAddressIndividualised && (
        <div className="individualised">
          <InfoText>{t('individualisedInformation')}</InfoText>
        </div>
      )}
      <div className="columns align-items-start gapped">
        <ClerkTranslatorPrimaryAddress addresses={translator?.address || []} />
      </div>
      <div className="columns margin-top-lg">
        <div className="columns margin-top-lg grow">
          <H3>Muut osoitteet</H3>
        </div>
        <CustomButton
          data-testid="clerk-translator-overview__translator-details__edit-btn"
          variant={Variant.Contained}
          color={Color.Secondary}
          startIcon={<AddIcon />}
          disabled={editDisabled}
          onClick={() => setOpen(true)}
        >
          Lisää uusi osoite
        </CustomButton>
        <ClerkTranslatorAddressModal
          open={open}
          onSave={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          showFieldErrorBeforeChange={showFieldErrorBeforeChange}
        />
      </div>
      <div className="columns align-items-start gapped">
        <ClerkTranslatorAddressFields
          addresses={translator?.address || []}
          onAddressChange={onAddressChange}
          editDisabled={editDisabled}
        />
        {/* <ComboBox
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
        /> */}
      </div>
      <H3>{t('header.contactInformation')}</H3>
      <div className="columns align-items-start gapped">
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
          ClerkTranslatorTextFieldEnum.ExtraInformation,
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
            !translator?.isAssuranceGiven && (
              <InfoText>{t('caveats.isNotAssuranceGiven')}</InfoText>
            )
          }
        />
      </div>
    </>
  );
};
