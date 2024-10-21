import { ChangeEvent, useEffect, useState } from 'react';
import { LabeledTextField } from 'shared/components';
import { InputAutoComplete, TextFieldTypes } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';

export const FillContactDetails = ({
  isLoading,
  enrollment,
  setIsStepValid,
  updatePublicEnrollment,
}: {
  isLoading: boolean;
  enrollment: PublicEnrollmentContact;
  setIsStepValid: (isValid: boolean) => void;
  updatePublicEnrollment: (
    enrollment: Partial<PublicEnrollmentCommon>,
  ) => AnyAction;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.fillContactDetails',
  });

  const [dirtyFields, setDirtyFields] = useState<
    Array<keyof PublicEnrollmentContact>
  >([]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsStepValid(true);
  });

  const handleChange =
    (fieldName: keyof PublicEnrollmentContact) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        updatePublicEnrollment({
          [fieldName]: event.target.value,
        }),
      );
    };

  const handleBlur = (fieldName: keyof PublicEnrollmentContact) => () => {
    if (!dirtyFields.includes(fieldName)) {
      setDirtyFields([...dirtyFields, fieldName]);
    }
  };

  const showCustomTextFieldError = () => {
    return false;
  };

  const getCustomTextFieldAttributes = (
    fieldName: keyof PublicEnrollmentContact,
  ) => ({
    id: `public-enrollment__contact-details__${fieldName}-field`,
    label: t(`${fieldName}.label`),
    onBlur: handleBlur(fieldName),
    onChange: handleChange(fieldName),
    error: showCustomTextFieldError(),
    required: true,
    disabled: isLoading,
  });

  return (
    <div className="margin-top-sm rows gapped public-enrollment__grid__contact-details">
      <div className="grid-2-columns gapped">
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
  );
};
