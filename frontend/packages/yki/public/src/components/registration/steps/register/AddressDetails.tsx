import {
  LabeledComboBox,
  LabeledTextField,
  LabeledTextFieldProps,
} from 'shared/components';
import { InputAutoComplete, TextFieldVariant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { useCountryOptions } from 'hooks/useCountryOptions';
import {
  PublicRegistrationErrors,
  usePublicRegistrationErrors,
} from 'hooks/usePublicRegistrationErrors';
import { PersonFillOutDetails } from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';
import { registrationSelector } from 'redux/selectors/registration';

// TODO remove me. deploy commit
export const AddressDetails = ({
  getLabeledTextFieldAttributes,
  setDirtyField,
  hasErrors,
}: {
  getLabeledTextFieldAttributes: (
    fieldName: keyof PersonFillOutDetails,
  ) => LabeledTextFieldProps;
  setDirtyField: (fieldName: keyof PublicRegistrationErrors) => void;
  hasErrors: (
    registrationErrors: PublicRegistrationErrors,
    fieldName: keyof PublicRegistrationErrors,
  ) => boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const translateCommon = useCommonTranslation();
  const { registration } = useAppSelector(registrationSelector);
  const countryOptions = useCountryOptions();
  const { isPhone } = useWindowProperties();
  const dispatch = useAppDispatch();

  const getRegistrationErrors = usePublicRegistrationErrors(true);
  const registrationErrors = getRegistrationErrors();

  const countryCodeDropdown = (
    <LabeledComboBox
      id="public-registration__contact-details__country-code-field"
      className="half-width-on-desktop"
      label={`${t('labels.countryCode')} *`}
      aria-label={`${t('labels.countryCode')} *`}
      placeholder={t('placeholders.countryCode')}
      variant={TextFieldVariant.Outlined}
      values={countryOptions}
      value={
        countryOptions.find((o) => o.value === registration.countryCode) || null
      }
      onChange={(v?: string) => {
        dispatch(updatePublicRegistration({ countryCode: v }));
      }}
      onBlur={() => setDirtyField('countryCode')}
      showError={hasErrors(registrationErrors, 'countryCode')}
      helperText={
        hasErrors(registrationErrors, 'countryCode')
          ? translateCommon(registrationErrors['countryCode'] as string)
          : ''
      }
    />
  );

  if (isPhone) {
    return (
      <>
        {countryCodeDropdown}
        <LabeledTextField
          {...getLabeledTextFieldAttributes('address')}
          value={registration.address || ''}
          autoComplete={InputAutoComplete.Street}
          fullWidth
        />
        <LabeledTextField
          {...getLabeledTextFieldAttributes('postNumber')}
          value={registration.postNumber || ''}
          autoComplete={InputAutoComplete.PostalCode}
          fullWidth
        />
        <LabeledTextField
          {...getLabeledTextFieldAttributes('postOffice')}
          value={registration.postOffice || ''}
          autoComplete={InputAutoComplete.Town}
          fullWidth
        />
      </>
    );
  } else {
    return (
      <>
        {countryCodeDropdown}
        <div className="registration-details__address-grid gapped">
          <LabeledTextField
            {...getLabeledTextFieldAttributes('address')}
            value={registration.address || ''}
            autoComplete={InputAutoComplete.Street}
          />
          <div className="columns gapped">
            <LabeledTextField
              {...getLabeledTextFieldAttributes('postNumber')}
              value={registration.postNumber || ''}
              autoComplete={InputAutoComplete.PostalCode}
            />
            <LabeledTextField
              {...getLabeledTextFieldAttributes('postOffice')}
              value={registration.postOffice || ''}
              autoComplete={InputAutoComplete.Town}
            />
          </div>
        </div>
      </>
    );
  }
};
