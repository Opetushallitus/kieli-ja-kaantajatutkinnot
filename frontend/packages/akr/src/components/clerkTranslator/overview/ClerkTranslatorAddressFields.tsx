import {
  FormHelperTextProps,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import {
  CustomButton,
  CustomModal,
  CustomTable,
  CustomTextField,
  InfoText,
  Text,
} from 'shared/components';
import { Color, TextFieldTypes, Variant } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import {
  translateOutsideComponent,
  useAppTranslation,
  useCommonTranslation,
} from 'configs/i18n';
import {
  ClerkTranslatorAddressFieldEnum,
  ClerkTranslatorAddressSource,
} from 'enums/clerkTranslator';
import { ClerkTranslatorAddress } from 'interfaces/clerkTranslator';
import { ClerkTranslatorAddressFieldProps } from 'interfaces/clerkTranslatorTextField';
import { WithId } from 'interfaces/with';

type ClerkTranslatorAddressRow = ClerkTranslatorAddress & WithId;

const textFieldMaxLengths = {
  [ClerkTranslatorAddressFieldEnum.Street]: 255,
  [ClerkTranslatorAddressFieldEnum.PostalCode]: 255,
  [ClerkTranslatorAddressFieldEnum.Town]: 255,
  [ClerkTranslatorAddressFieldEnum.Country]: 255,
};

const getTextFieldMaxLength = (field: ClerkTranslatorAddressFieldEnum) => {
  return textFieldMaxLengths[field] ?? null;
};

const getAddressFieldError = (
  address: ClerkTranslatorAddress | undefined,
  field: ClerkTranslatorAddressFieldEnum,
  required: boolean,
) => {
  const t = translateOutsideComponent();
  const type = TextFieldTypes.Text;
  const maxLength = getTextFieldMaxLength(field);
  const value = (address && address[field]) || '';

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
  const required =
    field == ClerkTranslatorAddressFieldEnum.Street ||
    field == ClerkTranslatorAddressFieldEnum.Town ||
    field == ClerkTranslatorAddressFieldEnum.PostalCode ||
    field == ClerkTranslatorAddressFieldEnum.Country;

  const fieldError = getAddressFieldError(translator, field, required);
  const showRequiredFieldError =
    showFieldError && fieldError?.length > 0 && required;
  const showHelperText =
    (showFieldError || !required) && fieldError?.length > 0;

  return (
    <CustomTextField
      value={translator ? translator[field] : undefined}
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
  onEditAddress,
  editDisabled,
}: {
  addresses: Array<ClerkTranslatorAddress>;
  onEditAddress: () => void;
  editDisabled: boolean;
}) => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorOverview.translatorDetails',
  });
  const address = addresses.filter((address) => address.selected);

  if (address.length <= 0) {
    return <></>;
  }

  const selectedAddress = address[0];

  return (
    <div data-testid="clerk-translator-address__primary-akr-address">
      <Text>{selectedAddress.street}</Text>
      <Text>
        {selectedAddress.postalCode} {selectedAddress.town}
      </Text>
      <Text>{selectedAddress.country}</Text>
      <br />
      <Text>
        {t('fields.source')}: {t('address.' + selectedAddress.source)} (
        {t('address.' + selectedAddress.type)})
      </Text>
      {!editDisabled &&
        ((selectedAddress.source === ClerkTranslatorAddressSource.AKR && (
          <CustomButton
            data-testid="clerk-translator-address__edit-primary-akr-address"
            className="margin-top-sm"
            variant={Variant.Outlined}
            color={Color.Secondary}
            onClick={onEditAddress}
          >
            {t('edit')}
          </CustomButton>
        )) || (
          <div className="individualised margin-top-lg">
            <InfoText>{t('readOnlyAddress')}</InfoText>
          </div>
        ))}
    </div>
  );
};

export const ClerkTranslatorAddressFields = ({
  addresses,
  onAddressChange,
  onEditAddress,
  editDisabled,
}: {
  addresses: Array<ClerkTranslatorAddress>;
  onAddressChange: (addresses: Array<ClerkTranslatorAddress>) => void;
  onEditAddress: () => void;
  editDisabled: boolean;
}) => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorOverview.translatorDetails',
  });
  const AddressHeader = () => (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>{t('fields.street')}</TableCell>
        <TableCell>{t('fields.postalCode')}</TableCell>
        <TableCell>{t('fields.town')}</TableCell>
        <TableCell>{t('fields.country')}</TableCell>
        <TableCell>{t('fields.source')}</TableCell>
        <TableCell>{t('fields.actions')}</TableCell>
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
        {t('address.' + address.source)}
        <br /> ({t('address.' + address.type)})
      </TableCell>
      <TableCell>
        <CustomButton
          data-testid="clerk-translator-address__add-address"
          variant={Variant.Outlined}
          color={Color.Secondary}
          disabled={editDisabled}
          onClick={handleSelectAsPrimary(address)}
        >
          {t('switchSource')}
        </CustomButton>
        {address.source === ClerkTranslatorAddressSource.AKR && (
          <CustomButton
            data-testid="clerk-translator-address__edit-akr-address"
            className="margin-top-sm"
            variant={Variant.Outlined}
            color={Color.Secondary}
            disabled={editDisabled}
            onClick={onEditAddress}
          >
            {t('edit')}
          </CustomButton>
        )}
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
    <div data-testid="clerk-translator-address__other-akr-address">
      <CustomTable
        className=""
        header={<AddressHeader />}
        data={addresses.filter(filterNonSelected).map(addIdToData)}
        getRowDetails={getRowDetails}
        stickyHeader
      />
    </div>
  );
};

export const ClerkTranslatorAddressModal = ({
  open,
  akrAddress,
  onSave,
  onCancel,
  showFieldErrorBeforeChange,
}: {
  open: boolean;
  akrAddress: ClerkTranslatorAddress;
  onSave: (address: ClerkTranslatorAddress) => void;
  onCancel: () => void;
  showFieldErrorBeforeChange: boolean;
}) => {
  // I18n
  const translateCommon = useCommonTranslation();

  const [address, setAddress] = useState<ClerkTranslatorAddress>(akrAddress);
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

  const getCommonAddressFieldProps = (
    field: ClerkTranslatorAddressFieldEnum,
  ) => {
    return {
      field,
      translator: address,
      onChange: (event: ChangeEvent<HTMLTextAreaElement>) =>
        setAddress({
          ...address,
          [field]: event.target.value,
        }),
      showFieldError: fieldErrors[field],
      onBlur: setFieldErrorOnBlur(field),
      fullWidth: true,
      'data-testid': `clerk-translator__address-information__${field}`,
    };
  };

  return (
    <CustomModal
      open={open}
      role="dialog"
      aria-labelledby="modal-title"
      modalTitle={translateCommon('edit')}
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
            onClick={() => onSave(address)}
            variant={Variant.Contained}
            color={Color.Secondary}
          >
            {translateCommon('yes')}
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};
