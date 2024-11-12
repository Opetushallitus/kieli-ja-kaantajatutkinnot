import { ChangeEvent, useEffect, useState } from 'react';
import { AnyAction } from 'redux';
import { LabeledTextField } from 'shared/components';
import { InputAutoComplete, TextFieldTypes } from 'shared/enums';
import { TextField } from 'shared/interfaces';
import { FieldErrors, getErrors, hasErrors } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import {
  PublicEnrollmentCommon,
  PublicEnrollmentContact,
  PublicEnrollmentContactRequestDetails,
} from 'interfaces/publicEnrollment';

const fields: Array<TextField<PublicEnrollmentContactRequestDetails>> = [
  {
    name: 'firstName',
    required: true,
    type: TextFieldTypes.Text,
    maxLength: 255,
  },
  {
    name: 'lastName',
    required: true,
    type: TextFieldTypes.Text,
    maxLength: 255,
  },
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
  errors: FieldErrors<PublicEnrollmentContactRequestDetails>,
  values: PublicEnrollmentContactRequestDetails,
  dirtyFields?: Array<keyof PublicEnrollmentContactRequestDetails>,
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
  updatePublicEnrollment,
  showValidation,
}: {
  isLoading: boolean;
  enrollment: PublicEnrollmentContact;
  setIsStepValid: (isValid: boolean) => void;
  updatePublicEnrollment: (
    enrollment: Partial<PublicEnrollmentCommon>,
  ) => AnyAction;
  showValidation: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.fillContactDetails',
  });
  const translateCommon = useCommonTranslation();

  const [dirtyFields, setDirtyFields] = useState<
    Array<keyof PublicEnrollmentContactRequestDetails>
  >([]);

  const dirty = showValidation ? undefined : dirtyFields;
  const errors = getErrors<PublicEnrollmentContactRequestDetails>({
    fields,
    values: enrollment,
    t: translateCommon,
    dirtyFields: dirty,
    extraValidation: emailsMatch.bind(this, t),
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsStepValid(
      !hasErrors<PublicEnrollmentContactRequestDetails>({
        fields,
        values: enrollment,
        t: translateCommon,
        extraValidation: emailsMatch.bind(this, t),
      }),
    );
  }, [setIsStepValid, enrollment, t, translateCommon]);

  const handleChange =
    (fieldName: keyof PublicEnrollmentContact) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        updatePublicEnrollment({
          [fieldName]: event.target.value,
        }),
      );
    };

  const handleBlur =
    (fieldName: keyof PublicEnrollmentContactRequestDetails) => () => {
      if (!dirtyFields.includes(fieldName)) {
        setDirtyFields([...dirtyFields, fieldName]);
      }
    };

  const showCustomTextFieldError = (
    fieldName: keyof PublicEnrollmentContactRequestDetails,
  ) => {
    return !!errors[fieldName];
  };

  const getCustomTextFieldAttributes = (
    fieldName: keyof PublicEnrollmentContactRequestDetails,
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
    <div className="margin-top-sm rows gapped">
      <div className="grid-3-columns gapped">
        <LabeledTextField
          {...getCustomTextFieldAttributes('firstName')}
          type={TextFieldTypes.Text}
          autoComplete={InputAutoComplete.FirstName}
          value={enrollment.firstName}
        />
        <LabeledTextField
          {...getCustomTextFieldAttributes('lastName')}
          type={TextFieldTypes.Text}
          autoComplete={InputAutoComplete.LastName}
          value={enrollment.lastName}
        />
      </div>
      <div className="grid-3-columns gapped">
        <LabeledTextField
          {...getCustomTextFieldAttributes('phoneNumber')}
          placeholder={'Esim. 0401234567'}
          type={TextFieldTypes.PhoneNumber}
          value={enrollment.phoneNumber}
          autoComplete={InputAutoComplete.PhoneNumber}
        />
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
  );
};
