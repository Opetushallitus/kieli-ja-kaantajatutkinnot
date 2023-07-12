import { ChangeEvent, useEffect, useState } from 'react';
import { H2, LabeledTextField, Text } from 'shared/components';
import { InputAutoComplete, TextFieldTypes } from 'shared/enums';
import { TextField } from 'shared/interfaces';
import { FieldErrors, getErrors, hasErrors } from 'shared/utils';

import { PersonDetails } from 'components/publicEnrollment/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import {
  PublicEnrollment,
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
  dirtyFields?: Array<keyof PublicEnrollmentContactDetails>
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
  enrollment,
  isLoading,
  setIsStepValid,
  showValidation,
}: {
  enrollment: PublicEnrollment;
  isLoading: boolean;
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

  const dirty = showValidation ? undefined : dirtyFields;
  const errors = getErrors<PublicEnrollmentContactDetails>({
    fields,
    values: enrollment,
    t: translateCommon,
    dirtyFields: dirty,
    extraValidation: emailsMatch.bind(this, t),
  });

  useEffect(() => {
    setIsStepValid(
      !hasErrors<PublicEnrollmentContactDetails>({
        fields,
        values: enrollment,
        t: translateCommon,
        extraValidation: emailsMatch.bind(this, t),
      })
    );
  }, [setIsStepValid, enrollment, t, translateCommon]);

  const handleChange =
    (fieldName: keyof PublicEnrollmentContactDetails) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        updatePublicEnrollment({
          [fieldName]: event.target.value,
        })
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
          })
        );
      }
    };

  const showCustomTextFieldError = (
    fieldName: keyof PublicEnrollmentContactDetails
  ) => {
    return !!errors[fieldName];
  };

  const getCustomTextFieldAttributes = (
    fieldName: keyof PublicEnrollmentContactDetails
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

  return (
    <div className="margin-top-sm rows gapped public-enrollment__grid__contact-details">
      <PersonDetails />
      <div className="margin-top-lg rows gapped">
        <H2>{t('title')}</H2>
        <Text>{translateCommon('requiredFieldsInfo')}</Text>
        <div className="grid-2-columns gapped">
          <LabeledTextField
            {...getCustomTextFieldAttributes('email')}
            placeholder={t('email.placeholder')}
            type={TextFieldTypes.Email}
            value={enrollment.email}
            autoComplete={InputAutoComplete.Email}
          />
          <LabeledTextField
            {...getCustomTextFieldAttributes('emailConfirmation')}
            placeholder={t('emailConfirmation.placeholder')}
            type={TextFieldTypes.Email}
            value={enrollment.emailConfirmation}
            onPaste={(e) => {
              e.preventDefault();

              return false;
            }}
          />
        </div>
      </div>
      <LabeledTextField
        {...getCustomTextFieldAttributes('phoneNumber')}
        className="phone-number"
        value={enrollment.phoneNumber}
        type={TextFieldTypes.PhoneNumber}
        autoComplete={InputAutoComplete.PhoneNumber}
      />
    </div>
  );
};
