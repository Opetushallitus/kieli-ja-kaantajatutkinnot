import { LabeledTextField, LabeledTextFieldProps } from 'shared/components';
import { InputAutoComplete } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useAppSelector } from 'configs/redux';
import { PersonFillOutDetails } from 'interfaces/publicRegistration';
import { registrationSelector } from 'redux/selectors/registration';

export const AddressDetails = ({
  getLabeledTextFieldAttributes,
}: {
  getLabeledTextFieldAttributes: (
    fieldName: keyof PersonFillOutDetails
  ) => LabeledTextFieldProps;
}) => {
  const { registration } = useAppSelector(registrationSelector);
  const { isPhone } = useWindowProperties();

  if (isPhone) {
    return (
      <>
        <LabeledTextField
          {...getLabeledTextFieldAttributes('address')}
          value={registration.address || ''}
          autoComplete={InputAutoComplete.Street}
          fullWidth
        />
        <LabeledTextField
          {...getLabeledTextFieldAttributes('postNumber')}
          value={registration.postNumber || ''}
          autoComplete={InputAutoComplete.PostalCode}
          fullWidth
        />
        <LabeledTextField
          {...getLabeledTextFieldAttributes('postOffice')}
          value={registration.postOffice || ''}
          autoComplete={InputAutoComplete.Town}
          fullWidth
        />
      </>
    );
  } else {
    return (
      <div className="registration-details__address-grid gapped">
        <LabeledTextField
          {...getLabeledTextFieldAttributes('address')}
          value={registration.address || ''}
          autoComplete={InputAutoComplete.Street}
        />
        <div className="columns gapped">
          <LabeledTextField
            {...getLabeledTextFieldAttributes('postNumber')}
            value={registration.postNumber || ''}
            autoComplete={InputAutoComplete.PostalCode}
          />
          <LabeledTextField
            {...getLabeledTextFieldAttributes('postOffice')}
            value={registration.postOffice || ''}
            autoComplete={InputAutoComplete.Town}
          />
        </div>
      </div>
    );
  }
};
