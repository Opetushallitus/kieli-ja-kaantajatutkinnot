import {
  FormHelperTextProps,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import {
  //ComboBox,
  CustomButton,
  CustomModal,
  CustomTable,
  CustomTextField,
  InfoText,
  Text,
} from 'shared/components';
import {
  Color,
  TextFieldTypes /*TextFieldVariant*/,
  Variant,
} from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import {
  translateOutsideComponent,
  useAppTranslation,
  useCommonTranslation,
  //useKoodistoCountriesTranslation,
} from 'configs/i18n';
import { ClerkTranslatorAddressFieldEnum } from 'enums/clerkTranslator';
import { ClerkTranslatorAddress } from 'interfaces/clerkTranslator';
import { ClerkTranslatorAddressFieldProps } from 'interfaces/clerkTranslatorTextField';
import { WithId } from 'interfaces/with';
//import koodistoCountriesFI from 'public/i18n/koodisto/countries/koodisto_countries_fi-FI.json';

type ClerkTranslatorAddressRow = ClerkTranslatorAddress & WithId;

const textFieldMaxLengths = {
  [ClerkTranslatorAddressFieldEnum.Street]: 4096,
  [ClerkTranslatorAddressFieldEnum.PostalCode]: 4096,
  [ClerkTranslatorAddressFieldEnum.Town]: 4096,
  [ClerkTranslatorAddressFieldEnum.Country]: 4096,
};

const getTextFieldMaxLength = (field: ClerkTranslatorAddressFieldEnum) => {
  return textFieldMaxLengths[field] ?? null;
};

const getAddressFieldError = (
  translator: ClerkTranslatorAddress | undefined,
  field: ClerkTranslatorAddressFieldEnum,
  required: boolean,
) => {
  const t = translateOutsideComponent();
  const type = TextFieldTypes.Text;
  const maxLength = getTextFieldMaxLength(field);
  const value = '';

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

const ClerkTranslatorAddressTextField = ({
  translator,
  field,
  onChange,
  showFieldError,
  ...rest
}: ClerkTranslatorAddressFieldProps) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorOverview.translatorDetails.fields',
  });
  const required = field == ClerkTranslatorAddressFieldEnum.Street;
  const fieldError = getAddressFieldError(translator, field, required);
  const showRequiredFieldError =
    showFieldError && fieldError?.length > 0 && required;
  const showHelperText =
    (showFieldError || !required) && fieldError?.length > 0;

  return (
    <CustomTextField
      label={t(field)}
      onChange={onChange}
      type={TextFieldTypes.Text}
      FormHelperTextProps={{ component: 'div' } as FormHelperTextProps}
      error={showRequiredFieldError}
      showHelperText={showHelperText}
      helperText={getHelperText(showRequiredFieldError, fieldError)}
      {...rest}
    />
  );
};

export const ClerkTranslatorPrimaryAddress = ({
  addresses,
}: {
  addresses: Array<ClerkTranslatorAddress>;
}) => {
  const { t } = useAppTranslation({
    keyPrefix:
      'akr.component.clerkTranslatorOverview.translatorDetails.address',
  });
  const address = addresses.filter((address) => address.selected);

  if (address.length <= 0) {
    return <></>;
  }

  const selectedAddress = address[0];

  return (
    <div>
      <Text>{selectedAddress.street}</Text>
      <Text>
        {selectedAddress.postalCode} {selectedAddress.town}
      </Text>
      <Text>{selectedAddress.country}</Text>
      <br />
      <Text>
        Osoitteen lähde: {t(selectedAddress.source)} ({t(selectedAddress.type)})
      </Text>
    </div>
  );
};

export const ClerkTranslatorAddressFields = ({
  addresses,
  onAddressChange,
  editDisabled,
}: {
  addresses: Array<ClerkTranslatorAddress>;
  onAddressChange: (addresses: Array<ClerkTranslatorAddress>) => void;
  editDisabled: boolean;
}) => {
  const { t } = useAppTranslation({
    keyPrefix:
      'akr.component.clerkTranslatorOverview.translatorDetails.address',
  });
  const AddressHeader = () => (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>Katu</TableCell>
        <TableCell>Postinumero </TableCell>
        <TableCell>Kaupunki</TableCell>
        <TableCell>Maa</TableCell>
        <TableCell>Osoitteen lähde</TableCell>
        <TableCell>Toiminnot</TableCell>
      </TableRow>
    </TableHead>
  );

  const handleSelectAsPrimary = (address: ClerkTranslatorAddress) => () =>
    onAddressChange(
      addresses.map((addr) => ({
        ...addr,
        selected: addr.type === address.type && addr.source === address.source,
      })),
    );

  const getRowDetails = (address: ClerkTranslatorAddress) => (
    <TableRow>
      <TableCell>{address[ClerkTranslatorAddressFieldEnum.Street]}</TableCell>
      <TableCell>
        {address[ClerkTranslatorAddressFieldEnum.PostalCode]}
      </TableCell>
      <TableCell>{address[ClerkTranslatorAddressFieldEnum.Town]}</TableCell>
      <TableCell>{address[ClerkTranslatorAddressFieldEnum.Country]}</TableCell>
      <TableCell>
        {t(address.source)}
        <br /> ({t(address.type)})
      </TableCell>
      <TableCell>
        <CustomButton
          data-testid="meeting-dates-page__add-btn"
          variant={Variant.Outlined}
          color={Color.Secondary}
          disabled={editDisabled}
          onClick={handleSelectAsPrimary(address)}
        >
          Vaihda lähteeksi
        </CustomButton>
      </TableCell>
    </TableRow>
  );

  const filterNonSelected = (address: ClerkTranslatorAddress) =>
    !address.selected;
  const addIdToData = (
    address: ClerkTranslatorAddress,
    idx: number,
  ): ClerkTranslatorAddressRow => ({
    id: idx,
    ...address,
  });

  return (
    <CustomTable
      className=""
      header={<AddressHeader />}
      data={addresses.filter(filterNonSelected).map(addIdToData)}
      getRowDetails={getRowDetails}
      stickyHeader
    />
  );
};

export const ClerkTranslatorAddressModal = ({
  open,
  onSave,
  onCancel,
  showFieldErrorBeforeChange,
}: {
  open: boolean;
  onSave: () => void;
  onCancel: () => void;
  showFieldErrorBeforeChange: boolean;
}) => {
  // I18n
  const translateCommon = useCommonTranslation();
  // TODO: M.S. poista tarpeettomiksi jääneet useKoodistoCountriesTranslation()
  //const translateCountry = useKoodistoCountriesTranslation();

  const [address, setAddress] = useState<ClerkTranslatorAddress>({
    street: '',
    postalCode: '',
    town: '',
    country: '',
    source: '',
    type: '',
    selected: false,
  });
  const initialFieldErrors = Object.values(
    ClerkTranslatorAddressFieldEnum,
  ).reduce((acc, val) => {
    return { ...acc, [val]: showFieldErrorBeforeChange };
  }, {}) as Record<ClerkTranslatorAddressFieldEnum, boolean>;

  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const setFieldErrorOnBlur =
    (field: ClerkTranslatorAddressFieldEnum) => () => {
      setFieldErrors((prevFieldErrors) => ({
        ...prevFieldErrors,
        [field]: true,
      }));
    };

  const onAddressFieldChange = (e: ChangeEvent<HTMLTextAreaElement>) => {};

  const getCommonAddressFieldProps = (
    field: ClerkTranslatorAddressFieldEnum,
  ) => {
    return {
      field,
      address,
      onChange: onAddressFieldChange,
      showFieldError: fieldErrors[field],
      onBlur: setFieldErrorOnBlur(field),
      fullWidth: true,
      'data-testid': `clerk-translator__address-information__${field}`,
    };
  };

  return (
    <CustomModal
      open={open}
      aria-labelledby="modal-title"
      modalTitle="Lisää osoite"
      onCloseModal={onCancel}
    >
      <div>
        <div className="columns align-items-start gapped">
          <ClerkTranslatorAddressTextField
            {...getCommonAddressFieldProps(
              ClerkTranslatorAddressFieldEnum.Street,
            )}
          />
          <ClerkTranslatorAddressTextField
            {...getCommonAddressFieldProps(
              ClerkTranslatorAddressFieldEnum.PostalCode,
            )}
          />
          <ClerkTranslatorAddressTextField
            {...getCommonAddressFieldProps(
              ClerkTranslatorAddressFieldEnum.Town,
            )}
          />
          <ClerkTranslatorAddressTextField
            {...getCommonAddressFieldProps(
              ClerkTranslatorAddressFieldEnum.Country,
            )}
          />
        </div>
        <div className="columns flex-end margin-top-lg gapped">
          <CustomButton
            className="margin-right-xs"
            onClick={onCancel}
            variant={Variant.Text}
            color={Color.Secondary}
          >
            {translateCommon('cancel')}
          </CustomButton>
          <CustomButton
            className="margin-right-xs"
            onClick={onSave}
            variant={Variant.Contained}
            color={Color.Secondary}
          >
            Lisää
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};
