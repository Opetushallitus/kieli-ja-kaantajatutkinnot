import { Divider } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { LabeledTextField } from 'shared/components';
import { InputAutoComplete, TextFieldTypes } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PersonDetails } from 'components/publicEnrollmentAppointment/steps/PersonDetails';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import {
  PublicEnrollmentAppointment,
  PublicEnrollmentContactDetails,
} from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';

export const FillContactDetails = ({
  isLoading,
  enrollment,
  setIsStepValid,
}: {
  isLoading: boolean;
  enrollment: PublicEnrollmentAppointment;
  setIsStepValid: (isValid: boolean) => void;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.fillContactDetails',
  });

  const [dirtyFields, setDirtyFields] = useState<
    Array<keyof PublicEnrollmentContactDetails>
  >([]);

  const dispatch = useAppDispatch();

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

  const showCustomTextFieldError = () => {
    return false;
  };

  const getCustomTextFieldAttributes = (
    fieldName: keyof PublicEnrollmentContactDetails,
  ) => ({
    id: `public-enrollment__contact-details__${fieldName}-field`,
    label: t(`${fieldName}.label`),
    onBlur: handleBlur(fieldName),
    onChange: handleChange(fieldName),
    error: showCustomTextFieldError(),
    required: true,
    disabled: isLoading,
  });

  const { isPhone } = useWindowProperties();

  return (
    <div className="margin-top-sm rows gapped public-enrollment__grid__contact-details">
      <PersonDetails />
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
