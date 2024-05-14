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
  ClerkTranslatorAddressSource,
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

const emptyAddress = {
  street: '',
  postalCode: '',
  town: '',
  country: '',
  source: ClerkTranslatorAddressSource.AKR,
  type: 'yhteystietotyyppi14',
  selected: false,
};

const findAkrAddress = (addresses: Array<ClerkTranslatorAddress>) =>
  addresses.find((addr) => addr.source === ClerkTranslatorAddressSource.AKR);

const findVisibleAkrAddress = (addresses: Array<ClerkTranslatorAddress>) =>
  addresses
    .filter(
      (addr) => addr.street || addr.country || addr.town || addr.postalCode,
    )
    .find((addr) => addr.source === ClerkTranslatorAddressSource.AKR);

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
  onTextFieldChange,
  onAddressChange,
  onCheckBoxChange,
  editDisabled,
  topControlButtons,
  showFieldErrorBeforeChange,
}: {
  translator?: ClerkTranslatorBasicInformation;
  isPersonalInformationIndividualised?: boolean;
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

  const hasAkrAddress =
    translator?.address && !!findAkrAddress(translator.address);

  const hasVisibleAkrAddress =
    translator?.address && !!findVisibleAkrAddress(translator.address);

  const modifyOrAppend = (
    address: ClerkTranslatorAddress,
    addresses: Array<ClerkTranslatorAddress>,
  ) =>
    hasAkrAddress
      ? addresses.map((addr) =>
          addr.source === address.source && addr.type === address.type
            ? address
            : addr,
        )
      : [...addresses, address];

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
      <div>
        <ClerkTranslatorPrimaryAddress
          addresses={translator?.address || []}
          editDisabled={editDisabled}
          onEditAddress={() => setOpen(true)}
        />
      </div>
      <div className="columns margin-top-lg">
        <div className="columns margin-top-lg grow">
          <H3>{t('header.addressOther')}</H3>
        </div>
        <CustomButton
          data-testid="clerk-translator-overview__translator-address__add-btn"
          variant={Variant.Contained}
          color={Color.Secondary}
          startIcon={<AddIcon />}
          disabled={editDisabled || hasVisibleAkrAddress}
          onClick={() => setOpen(true)}
        >
          {t('addAddress')}
        </CustomButton>
        {open && (
          <ClerkTranslatorAddressModal
            open={open}
            akrAddress={
              (translator?.address && findAkrAddress(translator.address)) ||
              emptyAddress
            }
            onSave={(address) => {
              setOpen(false);
              if (translator) {
                onAddressChange(modifyOrAppend(address, translator.address));
              }
            }}
            onCancel={() => setOpen(false)}
            showFieldErrorBeforeChange={false}
          />
        )}
      </div>
      <div className="columns align-items-start gapped">
        <ClerkTranslatorAddressFields
          addresses={translator?.address || []}
          onAddressChange={onAddressChange}
          editDisabled={editDisabled}
          onEditAddress={() => setOpen(true)}
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
