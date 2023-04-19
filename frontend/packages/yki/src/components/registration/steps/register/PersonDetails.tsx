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
        />
        <CustomTextField
          {...getCustomTextFieldAttributes('lastName')}
          value={registration.lastName || ''}
        />
      </div>
      <div className="registration-details__address-grid gapped">
        <CustomTextField
          {...getCustomTextFieldAttributes('address')}
          value={registration.address || ''}
        />
        <div className="columns gapped">
          <CustomTextField
            {...getCustomTextFieldAttributes('postNumber')}
            value={registration.postNumber || ''}
          />
          <CustomTextField
            {...getCustomTextFieldAttributes('postOffice')}
            value={registration.postOffice || ''}
          />
        </div>
      </div>
    </>
  );
};
