import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import { ChangeEvent, useMemo, useState } from 'react';
import {
  CustomSwitch,
  CustomTextField,
  CustomTextFieldProps,
  H2,
  H3,
  InfoText,
  Text,
  valueAsOption,
} from 'shared/components';
import { Color, TextFieldTypes } from 'shared/enums';
import { ComboBoxOption } from 'shared/interfaces';
import { InputFieldUtils } from 'shared/utils';

import {
  translateOutsideComponent,
  useAppTranslation,
  useCommonTranslation,
} from 'configs/i18n';
import {
  AreaOfOperation,
  ClerkInterpreterTextFieldEnum,
} from 'enums/clerkInterpreter';
import {
  ClerkInterpreterBasicInformation,
  ClerkInterpreterTextFields,
} from 'interfaces/clerkInterpreter';
import koodistoRegionsFI from 'public/i18n/koodisto/regions/koodisto_regions_fi-FI.json';
import { RegionUtils } from 'utils/regions';

type ClerkInterpreterTextFieldProps = {
  field: ClerkInterpreterTextFieldEnum;
  interpreterTextFields?: ClerkInterpreterTextFields;
  showFieldError: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
} & CustomTextFieldProps;

const textFieldMaxLengths = {
  [ClerkInterpreterTextFieldEnum.IdentityNumber]: 255,
  [ClerkInterpreterTextFieldEnum.LastName]: 255,
  [ClerkInterpreterTextFieldEnum.FirstName]: 255,
  [ClerkInterpreterTextFieldEnum.NickName]: 255,
  [ClerkInterpreterTextFieldEnum.Email]: 255,
  [ClerkInterpreterTextFieldEnum.PhoneNumber]: 255,
  [ClerkInterpreterTextFieldEnum.OtherContactInfo]: 255,
  [ClerkInterpreterTextFieldEnum.Street]: 255,
  [ClerkInterpreterTextFieldEnum.PostalCode]: 255,
  [ClerkInterpreterTextFieldEnum.Town]: 255,
  [ClerkInterpreterTextFieldEnum.Country]: 255,
  [ClerkInterpreterTextFieldEnum.ExtraInformation]: 4096,
};

const getTextFieldMaxLength = (field: ClerkInterpreterTextFieldEnum) => {
  return textFieldMaxLengths[field] ?? null;
};

const getTextFieldType = (field: ClerkInterpreterTextFieldEnum) => {
  switch (field) {
    case ClerkInterpreterTextFieldEnum.PhoneNumber:
      return TextFieldTypes.PhoneNumber;
    case ClerkInterpreterTextFieldEnum.Email:
      return TextFieldTypes.Email;
    case ClerkInterpreterTextFieldEnum.ExtraInformation:
      return TextFieldTypes.Textarea;
    case ClerkInterpreterTextFieldEnum.IdentityNumber:
      return TextFieldTypes.PersonalIdentityCode;
    default:
      return TextFieldTypes.Text;
  }
};

const getFieldError = (
  field: ClerkInterpreterTextFieldEnum,
  required: boolean,
  interpreterTextFields?: ClerkInterpreterTextFields,
) => {
  const t = translateOutsideComponent();
  const type = getTextFieldType(field);
  const value = (interpreterTextFields && interpreterTextFields[field]) || '';
  const maxLength = getTextFieldMaxLength(field);

  const error = InputFieldUtils.inspectCustomTextFieldErrors(
    type,
    value,
    required,
    maxLength,
  );

  return error ? t(`otr.${error}`) : '';
};

const getHelperText = (isRequiredFieldError: boolean, fieldError: string) =>
  isRequiredFieldError ? fieldError : <InfoText>{fieldError}</InfoText>;

const ClerkInterpreterDetailsTextField = ({
  field,
  interpreterTextFields,
  onChange,
  showFieldError,
  ...rest
}: ClerkInterpreterTextFieldProps) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix:
      'otr.component.clerkInterpreterOverview.interpreterDetails.fields',
  });
  const required = [
    ClerkInterpreterTextFieldEnum.LastName,
    ClerkInterpreterTextFieldEnum.FirstName,
    ClerkInterpreterTextFieldEnum.NickName,
    ClerkInterpreterTextFieldEnum.IdentityNumber,
    ClerkInterpreterTextFieldEnum.Email,
  ].includes(field);

  const fieldError = getFieldError(field, required, interpreterTextFields);
  const showRequiredFieldError =
    showFieldError && fieldError?.length > 0 && required;
  const showHelperText =
    (showFieldError || !required) && fieldError?.length > 0;

  return (
    <CustomTextField
      value={(interpreterTextFields && interpreterTextFields[field]) ?? ''}
      label={t(field)}
      onChange={onChange}
      type={getTextFieldType(field)}
      error={showRequiredFieldError}
      showHelperText={showHelperText}
      helperText={getHelperText(showRequiredFieldError, fieldError)}
      {...rest}
    />
  );
};

const ClerkInterpreterDetailsRegions = ({
  regions = [],
  areaOfOperation,
  setAreaOfOperation,
  disabled,
  onChange,
}: {
  regions?: string[];
  areaOfOperation: AreaOfOperation;
  setAreaOfOperation: React.Dispatch<React.SetStateAction<AreaOfOperation>>;
  disabled: boolean;
  onChange: (value: ComboBoxOption[]) => void;
}) => {
  const { t } = useAppTranslation({
    keyPrefix:
      'otr.component.clerkInterpreterOverview.interpreterDetails.areaOfOperation',
  });

  const memoizedKoodistoRegions = useMemo(
    () => Object.keys(koodistoRegionsFI.otr.koodisto.regions),
    [],
  );

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setAreaOfOperation(event.target.value as AreaOfOperation);
    if (event.target.value === AreaOfOperation.All) {
      onChange([]);
    }
  };

  const handleFilterChange = ({}, value: ComboBoxOption[]) => {
    onChange(value);
  };

  const options = RegionUtils.getRegionAutocompleteValues(
    memoizedKoodistoRegions,
  );

  return (
    <div className="columns gapped">
      <FormControl>
        <RadioGroup
          name="controlled-radio-buttons-group"
          value={areaOfOperation}
          onChange={handleRadioButtonChange}
        >
          <FormControlLabel
            disabled={disabled}
            value={AreaOfOperation.All}
            control={<Radio />}
            label={t(`${AreaOfOperation.All}`)}
            checked={areaOfOperation === AreaOfOperation.All}
          />
          <FormControlLabel
            disabled={disabled}
            value={AreaOfOperation.Regions}
            control={<Radio />}
            label={t(`${AreaOfOperation.Regions}`)}
            checked={areaOfOperation === AreaOfOperation.Regions}
          />
        </RadioGroup>
      </FormControl>
      {areaOfOperation === AreaOfOperation.Regions && (
        <Autocomplete
          disabled={disabled}
          className="regions"
          value={regions.map((region) => valueAsOption(region))}
          onChange={handleFilterChange}
          multiple
          options={options}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          getOptionLabel={(option) => RegionUtils.translateRegion(option.value)}
          defaultValue={undefined}
          filterSelectedOptions
          renderInput={(params) => (
            <TextField {...params} label={t('chooseRegion')} />
          )}
        />
      )}
    </div>
  );
};

export const ClerkInterpreterDetailsFields = ({
  title,
  interpreterBasicInformation,
  isPersonalInformationIndividualised,
  isAddressIndividualised,
  areaOfOperation,
  setAreaOfOperation,
  onFieldChange,
  isViewMode,
  topControlButtons,
  showFieldErrorBeforeChange,
}: {
  title: string;
  interpreterBasicInformation: ClerkInterpreterBasicInformation | undefined;
  isPersonalInformationIndividualised?: boolean;
  isAddressIndividualised?: boolean;
  onFieldChange: (
    field: keyof ClerkInterpreterBasicInformation,
  ) => (
    eventOrValue:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | ComboBoxOption[],
  ) => void;
  areaOfOperation: AreaOfOperation;
  setAreaOfOperation: React.Dispatch<React.SetStateAction<AreaOfOperation>>;
  isViewMode: boolean;
  topControlButtons?: JSX.Element;
  showFieldErrorBeforeChange: boolean;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview.interpreterDetails',
  });
  const translateCommon = useCommonTranslation();

  const initialErrors = Object.values(ClerkInterpreterTextFieldEnum).reduce(
    (acc, val) => {
      return { ...acc, [val]: showFieldErrorBeforeChange };
    },
    {},
  ) as Record<ClerkInterpreterTextFieldEnum, boolean>;

  const [fieldErrors, setFieldErrors] = useState(initialErrors);
  const setFieldErrorOnBlur = (field: ClerkInterpreterTextFieldEnum) => () => {
    setFieldErrors({ ...fieldErrors, [field]: true });
  };

  const isIndividualisedValue = (field: ClerkInterpreterTextFieldEnum) => {
    const isIdentityNumberField =
      field === ClerkInterpreterTextFieldEnum.IdentityNumber;

    const isIndividualisedPersonalInformationField =
      isPersonalInformationIndividualised &&
      [
        ClerkInterpreterTextFieldEnum.LastName,
        ClerkInterpreterTextFieldEnum.FirstName,
        ClerkInterpreterTextFieldEnum.NickName,
      ].includes(field);

    const isIndividualisedAddressField =
      isAddressIndividualised &&
      [
        ClerkInterpreterTextFieldEnum.Street,
        ClerkInterpreterTextFieldEnum.PostalCode,
        ClerkInterpreterTextFieldEnum.Town,
        ClerkInterpreterTextFieldEnum.Country,
      ].includes(field);

    return (
      isIdentityNumberField ||
      isIndividualisedPersonalInformationField ||
      isIndividualisedAddressField
    );
  };

  const getCommonTextFieldProps = (field: ClerkInterpreterTextFieldEnum) => ({
    field,
    interpreterTextFields: interpreterBasicInformation,
    disabled: isViewMode || isIndividualisedValue(field),
    onChange: onFieldChange(field),
    onBlur: setFieldErrorOnBlur(field),
    showFieldError: fieldErrors[field],
    'data-testid': `clerk-interpreter__basic-information__${field}`,
  });

  return (
    <>
      <div className="columns margin-top-lg">
        <H2 data-testid="clerk-interpreter__basic-information__title">
          {title}
        </H2>
      </div>
      <div className="columns">
        <div className="columns grow">
          <H3>{t('header.personalInformation')}</H3>
          {isPersonalInformationIndividualised && (
            <div className="individualised">
              <InfoText>{t('individualisedInformation')}</InfoText>
            </div>
          )}
        </div>
        {topControlButtons}
      </div>
      <div className="grid-columns gapped">
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.LastName)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.FirstName)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.NickName)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(
            ClerkInterpreterTextFieldEnum.IdentityNumber,
          )}
        />
      </div>
      <div className="columns">
        <H3>{t('header.address')}</H3>
        {isAddressIndividualised && (
          <div className="individualised">
            <InfoText>{t('individualisedInformation')}</InfoText>
          </div>
        )}
      </div>
      <div className="grid-columns gapped">
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.Street)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.PostalCode)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.Town)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.Country)}
        />
      </div>
      <H3>{t('header.contactInformation')}</H3>
      <div className="grid-columns gapped">
        <div className="columns">
          <ClerkInterpreterDetailsTextField
            {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.Email)}
            fullWidth
          />
          <Checkbox
            color={Color.Secondary}
            checked={interpreterBasicInformation?.permissionToPublishEmail}
            onChange={onFieldChange('permissionToPublishEmail')}
            disabled={isViewMode}
          />
          <Text>{translateCommon('permissionToPublish')}</Text>
        </div>
        <div className="columns">
          <ClerkInterpreterDetailsTextField
            {...getCommonTextFieldProps(
              ClerkInterpreterTextFieldEnum.PhoneNumber,
            )}
            fullWidth
          />
          <Checkbox
            color={Color.Secondary}
            checked={interpreterBasicInformation?.permissionToPublishPhone}
            onChange={onFieldChange('permissionToPublishPhone')}
            disabled={isViewMode}
          />
          <Text>{translateCommon('permissionToPublish')}</Text>
        </div>
        <div className="columns">
          <ClerkInterpreterDetailsTextField
            {...getCommonTextFieldProps(
              ClerkInterpreterTextFieldEnum.OtherContactInfo,
            )}
            fullWidth
          />
          <Checkbox
            color={Color.Secondary}
            checked={
              interpreterBasicInformation?.permissionToPublishOtherContactInfo
            }
            onChange={onFieldChange('permissionToPublishOtherContactInfo')}
            disabled={isViewMode}
          />
          <Text>{translateCommon('permissionToPublish')}</Text>
        </div>
      </div>
      <H3>{t('header.extraInformation')}</H3>
      <ClerkInterpreterDetailsTextField
        {...getCommonTextFieldProps(
          ClerkInterpreterTextFieldEnum.ExtraInformation,
        )}
        multiline
        fullWidth
      />
      <H3>{t('header.regions')}</H3>
      <ClerkInterpreterDetailsRegions
        regions={interpreterBasicInformation?.regions}
        areaOfOperation={areaOfOperation}
        setAreaOfOperation={setAreaOfOperation}
        onChange={onFieldChange('regions')}
        disabled={isViewMode}
      />
      <div className="rows gapped-xs">
        <H3>{t('header.isAssuranceGiven')}</H3>
        <CustomSwitch
          dataTestId="clerk-interpreter__basic-information__assurance-switch"
          disabled={isViewMode}
          onChange={onFieldChange('isAssuranceGiven')}
          value={interpreterBasicInformation?.isAssuranceGiven}
          leftLabel={translateCommon('no')}
          rightLabel={translateCommon('yes')}
          errorLabel={
            !interpreterBasicInformation?.isAssuranceGiven && (
              <InfoText>{t('caveats.isNotAssuranceGiven')}</InfoText>
            )
          }
        />
      </div>
    </>
  );
};
