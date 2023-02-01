import { Checkbox, FormControlLabel } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { CustomTextField, H3 } from 'shared/components';
import { Color, TextFieldTypes } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { CertificateShippingTextFields } from 'interfaces/common/enrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';
import { EnrollmentUtils } from 'utils/enrollment';

export const CertificateShipping = ({
  enrollment,
  editingDisabled,
  setValid,
}: {
  enrollment: PublicEnrollment;
  editingDisabled: boolean;
  setValid?: (isValid: boolean) => void;
}) => {
  const translateCommon = useCommonTranslation();

  const [fieldErrors, setFieldErrors] = useState({
    street: '',
    postalCode: '',
    town: '',
    country: '',
  });
  const maxLengths = {
    street: 255,
    postalCode: 8,
    town: 255,
    country: 16,
  };

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (setValid) {
      setValid(EnrollmentUtils.isValidCertificateShipping(enrollment));
    }
  }, [fieldErrors, setValid, enrollment]);

  const handleChange =
    (fieldName: keyof CertificateShippingTextFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (fieldErrors[fieldName]) {
        handleErrors(fieldName)(event);
      }

      dispatch(
        updatePublicEnrollment({
          [fieldName]: event.target.value,
        })
      );
    };

  const handleErrors =
    (fieldName: keyof CertificateShippingTextFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { type, value, required } = event.target;

      const error = InputFieldUtils.inspectCustomTextFieldErrors(
        type as TextFieldTypes,
        value,
        required,
        maxLengths[fieldName]
      );

      const fieldErrorMessage = error ? translateCommon(error) : '';

      setFieldErrors({
        ...fieldErrors,
        [fieldName]: fieldErrorMessage,
      });
    };

  const showCustomTextFieldError = (
    fieldName: keyof CertificateShippingTextFields
  ) => {
    return fieldErrors[fieldName].length > 0;
  };

  const getCustomTextFieldAttributes = (
    fieldName: keyof CertificateShippingTextFields
  ) => ({
    id: `public-enrollment__certificate-shipping__${fieldName}-field`,
    type: TextFieldTypes.Text,
    label: translateCommon(`enrollment.textFields.${fieldName}`),
    onBlur: handleErrors(fieldName),
    onChange: handleChange(fieldName),
    error: showCustomTextFieldError(fieldName),
    helperText: fieldErrors[fieldName],
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
      {!enrollment.digitalCertificateConsent && (
        <>
          <H3>
            {translateCommon('enrollment.certificateShipping.addressTitle')}
          </H3>
          <div className="grid-columns gapped">
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
        </>
      )}
    </div>
  );
};
