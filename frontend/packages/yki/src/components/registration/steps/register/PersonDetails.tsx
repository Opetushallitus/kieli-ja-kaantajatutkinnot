import { CustomTextField, CustomTextFieldProps } from 'shared/components';

import { useAppSelector } from 'configs/redux';
import { PersonFillOutDetails } from 'interfaces/publicRegistration';
import { registrationSelector } from 'redux/selectors/registration';

export const PersonDetails = ({
  getCustomTextFieldAttributes,
}: {
  getCustomTextFieldAttributes: (
    fieldName: keyof PersonFillOutDetails
  ) => CustomTextFieldProps;
}) => {
  const { registration } = useAppSelector(registrationSelector);

  return (
    <>
      <div className="grid-columns gapped">
        <CustomTextField
          {...getCustomTextFieldAttributes('firstNames')}
          value={registration.firstNames || ''}
          autoComplete="given-name"
        />
        <CustomTextField
          {...getCustomTextFieldAttributes('lastName')}
          value={registration.lastName || ''}
          autoComplete="family-name"
        />
      </div>
      <div className="registration-details__address-grid gapped">
        <CustomTextField
          {...getCustomTextFieldAttributes('address')}
          value={registration.address || ''}
          autoComplete="address-line1"
        />
        <div className="columns gapped">
          <CustomTextField
            {...getCustomTextFieldAttributes('postNumber')}
            value={registration.postNumber || ''}
            autoComplete="postal-code"
          />
          <CustomTextField
            {...getCustomTextFieldAttributes('postOffice')}
            value={registration.postOffice || ''}
            autoComplete="address-level1"
          />
        </div>
      </div>
    </>
  );
};
