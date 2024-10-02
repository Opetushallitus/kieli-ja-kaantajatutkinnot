import { Divider } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { H2, LabeledTextField, Text } from 'shared/components';
import { InputAutoComplete, TextFieldTypes } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';
import { TextField } from 'shared/interfaces';
import { FieldErrors } from 'shared/utils';

import { CertificateShipping } from 'components/publicEnrollmentAppointment/steps/CertificateShipping';
import { PersonDetails } from 'components/publicEnrollmentAppointment/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import {
  PublicEnrollment,
  PublicEnrollmentAppointment,
  PublicEnrollmentContactDetails,
} from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';

const fields: Array<TextField<PublicEnrollmentContactDetails>> = [
  {
    name: 'email',
    required: true,
    type: TextFieldTypes.Email,
    maxLength: 255,
  },
  {
    name: 'emailConfirmation',
    required: true,
    type: TextFieldTypes.Email,
    maxLength: 255,
  },
  {
    name: 'phoneNumber',
    required: true,
    type: TextFieldTypes.PhoneNumber,
    maxLength: 255,
  },
];

const emailsMatch = (
  t: (key: string) => string,
  errors: FieldErrors<PublicEnrollmentContactDetails>,
  values: PublicEnrollmentContactDetails,
  dirtyFields?: Array<keyof PublicEnrollmentContactDetails>,
) => {
  if (
    values.email !== values.emailConfirmation &&
    (!dirtyFields || dirtyFields.includes('emailConfirmation'))
  ) {
    return {
      ...errors,
      ['emailConfirmation']:
        errors['emailConfirmation'] ?? t('mismatchingEmailsError'),
    };
  }

  return errors;
};

export const FillContactDetails = ({
  isLoading,
  enrollment,
  setIsStepValid,
  showValidation,
}: {
  isLoading: boolean;
  enrollment: PublicEnrollmentAppointment;
  setIsStepValid: (isValid: boolean) => void;
  showValidation: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.fillContactDetails',
  });
  const translateCommon = useCommonTranslation();

  const [dirtyFields, setDirtyFields] = useState<
    Array<keyof PublicEnrollmentContactDetails>
  >([]);

  const dispatch = useAppDispatch();
  const errors = [];

  useEffect(() => {
    setIsStepValid(true);
  });

  const handleChange =
    (fieldName: keyof PublicEnrollmentContactDetails) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        updatePublicEnrollment({
          [fieldName]: event.target.value,
        }),
      );
    };

  const handleBlur =
    (fieldName: keyof PublicEnrollmentContactDetails) => () => {
      if (!dirtyFields.includes(fieldName)) {
        setDirtyFields([...dirtyFields, fieldName]);
      }
      if (fieldName === 'phoneNumber') {
        dispatch(
          updatePublicEnrollment({
            phoneNumber: enrollment.phoneNumber.replace(/\s/g, ''),
          }),
        );
      }
    };

  const showCustomTextFieldError = (
    fieldName: keyof PublicEnrollmentContactDetails,
  ) => {
    return false;
  };

  const getCustomTextFieldAttributes = (
    fieldName: keyof PublicEnrollmentContactDetails,
  ) => ({
    id: `public-enrollment__contact-details__${fieldName}-field`,
    label: t(`${fieldName}.label`),
    onBlur: handleBlur(fieldName),
    onChange: handleChange(fieldName),
    error: showCustomTextFieldError(fieldName),
    helperText: errors[fieldName],
    required: true,
    disabled: isLoading,
  });

  const { isPhone } = useWindowProperties();

  return (
    <div className="margin-top-sm rows gapped public-enrollment__grid__contact-details">
      <PersonDetails isPreviewStep={false} />
      <LabeledTextField
        {...getCustomTextFieldAttributes('phoneNumber')}
        className="phone-number"
        value={enrollment.phoneNumber}
        type={TextFieldTypes.PhoneNumber}
        autoComplete={InputAutoComplete.PhoneNumber}
      />
      {!isPhone && <Divider />}
      <CertificateShipping
        enrollment={enrollment}
        editingDisabled={isLoading}
        setValid={setIsStepValid}
        showValidation={false}
      />
    </div>
  );
};
