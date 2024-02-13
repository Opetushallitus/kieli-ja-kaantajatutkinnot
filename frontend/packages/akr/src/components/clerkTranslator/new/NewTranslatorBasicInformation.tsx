import { ChangeEvent } from 'react';

import { ClerkTranslatorDetailsFields } from 'components/clerkTranslator/overview/ClerkTranslatorDetailsFields';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ClerkNewTranslator } from 'interfaces/clerkNewTranslator';
import {
  ClerkTranslatorAddress,
  ClerkTranslatorBasicInformation,
  ClerkTranslatorTextFields,
} from 'interfaces/clerkTranslator';
import { updateClerkNewTranslator } from 'redux/reducers/clerkNewTranslator';
import { clerkNewTranslatorSelector } from 'redux/selectors/clerkNewTranslator';

export const NewTranslatorBasicInformation = ({
  onDetailsChange,
}: {
  onDetailsChange: () => void;
}) => {
  // Redux
  const { translator } = useAppSelector(clerkNewTranslatorSelector);
  const dispatch = useAppDispatch();

  const handleTextFieldChange =
    (field: keyof ClerkTranslatorTextFields) =>
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      handleFieldChange(field, event.target.value);
    };

  /*
  const handleComboBoxChange =
    (field: keyof ClerkTranslatorBasicInformation) => (value?: string) => {
      handleFieldChange(field, value);
    };
  */

  const handleCheckBoxChange =
    (field: keyof ClerkTranslatorBasicInformation) =>
    (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleFieldChange(field, checked);
    };

  const handleAddressChange = (addresses: Array<ClerkTranslatorAddress>) => {
    handleFieldChange('address', addresses);
  };

  const handleFieldChange = (
    field: keyof ClerkTranslatorBasicInformation,
    fieldValue: string | boolean | Array<ClerkTranslatorAddress> | undefined,
  ) => {
    const updatedTranslatorDetails = {
      ...translator,
      [field]: fieldValue,
    };
    onDetailsChange();
    dispatch(
      updateClerkNewTranslator(updatedTranslatorDetails as ClerkNewTranslator),
    );
  };

  return (
    <ClerkTranslatorDetailsFields
      translator={translator}
      isPersonalInformationIndividualised={translator.isIndividualised}
      isAddressIndividualised={translator.hasIndividualisedAddress}
      onTextFieldChange={(field: keyof ClerkTranslatorTextFields) =>
        handleTextFieldChange(field)
      }
      onAddressChange={handleAddressChange}
      // onComboBoxChange={(field: keyof ClerkTranslatorBasicInformation) =>
      //   handleComboBoxChange(field)
      // }
      onCheckBoxChange={(field: keyof ClerkTranslatorBasicInformation) =>
        handleCheckBoxChange(field)
      }
      editDisabled={false}
      showFieldErrorBeforeChange={false}
    />
  );
};
