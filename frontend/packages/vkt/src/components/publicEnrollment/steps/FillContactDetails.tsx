import { ChangeEvent, useEffect, useState } from 'react';
import { CustomTextField, H3 } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';
import { TextField } from 'shared/interfaces';
import {
  getEmptyErrorState,
  getErrors,
  InputFieldUtils,
  StringUtils,
} from 'shared/utils';

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

export const FillContactDetails = ({
  enrollment,
  isLoading,
  disableNext,
  showValidation,
}: {
  enrollment: PublicEnrollment;
  isLoading: boolean;
  disableNext: (disabled: boolean) => void;
  showValidation: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.fillContactDetails',
  });
  const translateCommon = useCommonTranslation();

  const [fieldErrors, setFieldErrors] = useState(getEmptyErrorState(fields));

  const dispatch = useAppDispatch();

  const errors = showValidation
    ? getErrors(fields, enrollment, translateCommon)
    : fieldErrors;

  useEffect(() => {
    const hasFieldErrors = !!(fieldErrors.email || fieldErrors.phoneNumber);

    const hasBlankFieldValues = [enrollment.email, enrollment.phoneNumber].some(
      StringUtils.isBlankString
    );
    const mismatchingEmails = enrollment.email !== enrollment.emailConfirmation;

    disableNext(hasFieldErrors || hasBlankFieldValues || mismatchingEmails);
  }, [fieldErrors, disableNext, enrollment]);

  const handleChange =
    (fieldName: keyof PublicEnrollmentContactDetails) =>
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
    (fieldName: keyof PublicEnrollmentContactDetails) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { type, value, required } = event.target;

      const error = InputFieldUtils.inspectCustomTextFieldErrors(
        type as TextFieldTypes,
        value,
        required
      );

      const fieldErrorMessage = error ? translateCommon(error) : '';

      const emailConfirmationErrorMessage =
        enrollment.emailConfirmation &&
        enrollment.email !== enrollment.emailConfirmation
          ? t('mismatchingEmailsError')
          : '';

      setFieldErrors({
        ...fieldErrors,
        [fieldName]: fieldErrorMessage,
        ['emailConfirmation']: emailConfirmationErrorMessage,
      });
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
    label: t(fieldName),
    onBlur: handleErrors(fieldName),
    onChange: handleChange(fieldName),
    error: showCustomTextFieldError(fieldName),
    helperText: errors[fieldName],
    required: true,
    disabled: isLoading,
  });

  return (
    <div className="margin-top-xxl rows gapped">
      <PersonDetails />
      <div className="margin-top-sm rows gapped">
        <H3>{t('title')}</H3>
        <div className="grid-columns gapped">
          <CustomTextField
            {...getCustomTextFieldAttributes('email')}
            type={TextFieldTypes.Email}
            value={enrollment.email}
          />
          <CustomTextField
            {...getCustomTextFieldAttributes('emailConfirmation')}
            type={TextFieldTypes.Email}
            value={enrollment.emailConfirmation}
            onPaste={(e) => {
              e.preventDefault();

              return false;
            }}
          />
        </div>
      </div>
      <CustomTextField
        {...getCustomTextFieldAttributes('phoneNumber')}
        className="phone-number"
        value={enrollment.phoneNumber}
        type={TextFieldTypes.PhoneNumber}
      />
    </div>
  );
};
