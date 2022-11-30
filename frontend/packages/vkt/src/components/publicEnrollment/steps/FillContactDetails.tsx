import { ChangeEvent, useEffect, useState } from 'react';
import { CustomTextField, H3 } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';
import { InputFieldUtils, StringUtils } from 'shared/utils';

import { PersonDetails } from 'components/publicEnrollment/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const FillContactDetails = ({
  isLoading,
  disableNext,
}: {
  isLoading: boolean;
  disableNext: (disabled: boolean) => void;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.fillContactDetails',
  });
  const translateCommon = useCommonTranslation();

  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    emailConfirmation: '',
    phoneNumber: '',
  });

  const { enrollment } = useAppSelector(publicEnrollmentSelector);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const hasFieldErrors = !!(fieldErrors.email || fieldErrors.phoneNumber);

    const hasBlankFieldValues = [enrollment.email, enrollment.phoneNumber].some(
      (v) => StringUtils.isBlankString(v)
    );
    const mismatchingEmails = enrollment.email !== enrollment.emailConfirmation;

    disableNext(hasFieldErrors || hasBlankFieldValues || mismatchingEmails);
  }, [fieldErrors, disableNext, enrollment]);

  const handleChange =
    (fieldName: keyof PublicEnrollment) =>
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
    (fieldName: keyof PublicEnrollment) =>
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

  const showCustomTextFieldError = (fieldName: keyof PublicEnrollment) => {
    return fieldErrors[fieldName]?.length > 0;
  };

  const getCustomTextFieldAttributes = (fieldName: keyof PublicEnrollment) => ({
    id: `public-enrollment__contact-details__${fieldName}-field`,
    label: t(fieldName),
    onBlur: handleErrors(fieldName),
    onChange: handleChange(fieldName),
    error: showCustomTextFieldError(fieldName),
    helperText: fieldErrors[fieldName],
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