import { ChangeEvent } from 'react';
import { CustomTextField } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';

import { PersonDetails } from 'components/registration/steps/register/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { usePublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import { PublicSuomiFiRegistration } from 'interfaces/publicRegistration';
import { updatePublicRegistration } from 'redux/reducers/registration';
import { registrationSelector } from 'redux/selectors/registration';

export const SuomiFiRegistrationDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const registration: Partial<PublicSuomiFiRegistration> =
    useAppSelector(registrationSelector).registration;
  const { showErrors } = useAppSelector(registrationSelector);

  const handleChange =
    (fieldName: keyof Omit<PublicSuomiFiRegistration, 'id'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        updatePublicRegistration({
          [fieldName]: event.target.value,
        })
      );
    };

  const getRegistrationErrors = usePublicRegistrationErrors(showErrors);
  const registrationErrors = getRegistrationErrors();

  const getCustomTextFieldAttributes = (
    fieldName: keyof Omit<PublicSuomiFiRegistration, 'id'>
  ) => {
    return {
      id: `public-registration__contact-details__${fieldName}-field`,
      label: t(fieldName),
      onChange: handleChange(fieldName),
      error: showErrors && !!registrationErrors[fieldName],
      helperText: registrationErrors[fieldName]
        ? translateCommon(registrationErrors[fieldName] as string)
        : '',
      required: true,
      disabled: ['firstNames', 'lastName'].includes(fieldName),
    };
  };

  return (
    <div className="registration-details rows gapped margin-top-sm">
      <PersonDetails
        getCustomTextFieldAttributes={getCustomTextFieldAttributes}
      />
      <div className="grid-columns gapped">
        <CustomTextField
          {...getCustomTextFieldAttributes('email')}
          type={TextFieldTypes.Email}
          value={registration.email || ''}
        />
        <CustomTextField
          {...getCustomTextFieldAttributes('emailConfirmation')}
          type={TextFieldTypes.Email}
          value={registration.emailConfirmation || ''}
          onPaste={(e) => {
            e.preventDefault();

            return false;
          }}
        />
      </div>
      <CustomTextField
        className="half-width-on-desktop"
        {...getCustomTextFieldAttributes('phoneNumber')}
        value={registration.phoneNumber || ''}
        type={TextFieldTypes.PhoneNumber}
      />
    </div>
  );
};
