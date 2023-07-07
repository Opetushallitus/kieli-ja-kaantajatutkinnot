import { LabeledTextField, LabeledTextFieldProps } from 'shared/components';
import { InputAutoComplete } from 'shared/enums';

import { useAppSelector } from 'configs/redux';
import { PersonFillOutDetails } from 'interfaces/publicRegistration';
import { registrationSelector } from 'redux/selectors/registration';

export const PersonDetails = ({
  getLabeledTextFieldAttributes,
}: {
  getLabeledTextFieldAttributes: (
    fieldName: keyof PersonFillOutDetails
  ) => LabeledTextFieldProps;
}) => {
  const { registration } = useAppSelector(registrationSelector);

  return (
    <>
      <div className="grid-columns gapped">
        <LabeledTextField
          {...getLabeledTextFieldAttributes('firstNames')}
          value={registration.firstNames || ''}
          autoComplete={InputAutoComplete.FirstName}
        />
        <LabeledTextField
          {...getLabeledTextFieldAttributes('lastName')}
          value={registration.lastName || ''}
          autoComplete={InputAutoComplete.LastName}
        />
      </div>
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
    </>
  );
};
