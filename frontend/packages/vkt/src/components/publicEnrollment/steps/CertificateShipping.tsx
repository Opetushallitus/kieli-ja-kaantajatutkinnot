import { Checkbox, FormControlLabel } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { CustomTextField, H3 } from 'shared/components';
import { Color, TextFieldTypes } from 'shared/enums';
import { InputFieldUtils, StringUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import {
  PublicEnrollment,
  PublicEnrollmentAddress,
} from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';

export const CertificateShipping = ({
  enrollment,
  editingDisabled,
  setValid,
}: {
  enrollment: PublicEnrollment;
  editingDisabled: boolean;
  setValid?: (isValid: boolean) => void;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.certificateShipping',
  });
  const translateCommon = useCommonTranslation();

  const [fieldErrors, setFieldErrors] = useState({
    street: '',
    postalCode: '',
    town: '',
    country: '',
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (setValid) {
      const hasFieldErrors = !!(
        fieldErrors.street ||
        fieldErrors.postalCode ||
        fieldErrors.town ||
        fieldErrors.country
      );

      const hasBlankFieldValues = [
        enrollment.street,
        enrollment.postalCode,
        enrollment.town,
        enrollment.country,
      ].some(StringUtils.isBlankString);

      setValid(
        enrollment.digitalCertificateConsent ||
          (!hasFieldErrors && !hasBlankFieldValues)
      );
    }
  }, [fieldErrors, setValid, enrollment]);

  const handleChange =
    (fieldName: keyof PublicEnrollmentAddress) =>
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
    (fieldName: keyof PublicEnrollmentAddress) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { type, value, required } = event.target;

      const error = InputFieldUtils.inspectCustomTextFieldErrors(
        type as TextFieldTypes,
        value,
        required
      );

      const fieldErrorMessage = error ? translateCommon(error) : '';

      setFieldErrors({
        ...fieldErrors,
        [fieldName]: fieldErrorMessage,
      });
    };

  const showCustomTextFieldError = (
    fieldName: keyof PublicEnrollmentAddress
  ) => {
    return fieldErrors[fieldName].length > 0;
  };

  const getCustomTextFieldAttributes = (
    fieldName: keyof PublicEnrollmentAddress
  ) => ({
    id: `public-enrollment__certificate-shipping__${fieldName}-field`,
    type: TextFieldTypes.Text,
    label: translateCommon(`address.${fieldName}`),
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
        label={t('consent')}
      />
      {!enrollment.digitalCertificateConsent && (
        <>
          <H3>{t('addressTitle')}</H3>
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
