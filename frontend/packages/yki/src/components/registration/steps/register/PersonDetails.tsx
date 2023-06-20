import { CustomTextField, CustomTextFieldProps } from 'shared/components';
import { InputAutoComplete } from 'shared/enums';

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
          autoComplete={InputAutoComplete.FirstName}
        />
        <CustomTextField
          {...getCustomTextFieldAttributes('lastName')}
          value={registration.lastName || ''}
          autoComplete={InputAutoComplete.LastName}
        />
      </div>
      <div className="registration-details__address-grid gapped">
        <CustomTextField
          {...getCustomTextFieldAttributes('address')}
          value={registration.address || ''}
          autoComplete={InputAutoComplete.Street}
        />
        <div className="columns gapped">
          <CustomTextField
            {...getCustomTextFieldAttributes('postNumber')}
            value={registration.postNumber || ''}
            autoComplete={InputAutoComplete.PostalCode}
          />
          <CustomTextField
            {...getCustomTextFieldAttributes('postOffice')}
            value={registration.postOffice || ''}
            autoComplete={InputAutoComplete.Town}
          />
        </div>
      </div>
    </>
  );
};
