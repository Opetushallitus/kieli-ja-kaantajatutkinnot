import { Checkbox, Collapse, FormControlLabel } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { CustomTextField, H3 } from 'shared/components';
import { Color, TextFieldTypes } from 'shared/enums';
import { TextField } from 'shared/interfaces';
import { getErrors, hasErrors } from 'shared/utils';

import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { CertificateShippingTextFields } from 'interfaces/common/enrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';

const fields: Array<TextField<CertificateShippingTextFields>> = [
  {
    name: 'street',
    required: true,
    type: TextFieldTypes.Text,
    maxLength: 255,
  },
  {
    name: 'postalCode',
    required: true,
    type: TextFieldTypes.Text,
    maxLength: 255,
  },
  { name: 'town', required: true, type: TextFieldTypes.Text, maxLength: 255 },
  {
    name: 'country',
    required: true,
    type: TextFieldTypes.Text,
    maxLength: 255,
  },
];

export const CertificateShipping = ({
  enrollment,
  editingDisabled,
  setValid,
  showValidation,
}: {
  enrollment: PublicEnrollment;
  editingDisabled: boolean;
  setValid: (isValid: boolean) => void;
  showValidation: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const digitalConsentEnabled = false;

  const [dirtyFields, setDirtyFields] = useState<
    Array<keyof CertificateShippingTextFields>
  >([]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (enrollment.digitalCertificateConsent) {
      setValid(true);

      return;
    }

    setValid(
      !hasErrors<CertificateShippingTextFields>({
        fields,
        values: enrollment,
        t: translateCommon,
      })
    );
  }, [setValid, enrollment, translateCommon]);

  const dirty = showValidation ? undefined : dirtyFields;
  const errors = getErrors<CertificateShippingTextFields>({
    fields,
    values: enrollment,
    t: translateCommon,
    dirtyFields: dirty,
  });

  const handleChange =
    (fieldName: keyof CertificateShippingTextFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        updatePublicEnrollment({
          [fieldName]: event.target.value,
        })
      );
    };

  const handleBlur = (fieldName: keyof CertificateShippingTextFields) => () => {
    if (!dirtyFields.includes(fieldName)) {
      setDirtyFields([...dirtyFields, fieldName]);
    }
  };

  const showCustomTextFieldError = (
    fieldName: keyof CertificateShippingTextFields
  ) => {
    return !!errors[fieldName];
  };

  const getCustomTextFieldAttributes = (
    fieldName: keyof CertificateShippingTextFields
  ) => ({
    id: `public-enrollment__certificate-shipping__${fieldName}-field`,
    type: TextFieldTypes.Text,
    label: translateCommon(`enrollment.textFields.${fieldName}`),
    onBlur: handleBlur(fieldName),
    onChange: handleChange(fieldName),
    error: showCustomTextFieldError(fieldName),
    helperText: errors[fieldName],
    required: true,
    disabled: editingDisabled,
  });

  const handleCheckboxClick = () => {
    dispatch(
      updatePublicEnrollment({
        digitalCertificateConsent: !enrollment.digitalCertificateConsent,
      })
    );
  };

  return (
    <div className="margin-top-lg rows gapped">
      {digitalConsentEnabled && (
        <FormControlLabel
          className="public-enrollment__grid__certificate-shipping__consent"
          control={
            <Checkbox
              onClick={handleCheckboxClick}
              color={Color.Secondary}
              checked={enrollment.digitalCertificateConsent}
              disabled={editingDisabled}
            />
          }
          label={translateCommon('enrollment.certificateShipping.consent')}
        />
      )}
      <Collapse
        orientation="vertical"
        in={!enrollment.digitalCertificateConsent}
      >
        <H3>
          {translateCommon('enrollment.certificateShipping.addressTitle')}
        </H3>
        <div className="margin-top-lg grid-columns gapped">
          <CustomTextField
            {...getCustomTextFieldAttributes('street')}
            value={enrollment.street}
          />
          <CustomTextField
            {...getCustomTextFieldAttributes('postalCode')}
            value={enrollment.postalCode}
          />
          <CustomTextField
            {...getCustomTextFieldAttributes('town')}
            value={enrollment.town}
          />
          <CustomTextField
            {...getCustomTextFieldAttributes('country')}
            value={enrollment.country}
          />
        </div>
      </Collapse>
    </div>
  );
};
