import { ChangeEvent } from 'react';
import { AutocompleteValue } from 'shared/components';

import { ClerkTranslatorDetailsFields } from 'components/clerkTranslator/overview/ClerkTranslatorDetailsFields';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ClerkNewTranslator } from 'interfaces/clerkNewTranslator';
import {
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

  const handleComboBoxChange =
    (field: keyof ClerkTranslatorBasicInformation) =>
    ({}, autocompleteValue?: AutocompleteValue) => {
      handleFieldChange(field, autocompleteValue?.value);
    };

  const handleCheckBoxChange =
    (field: keyof ClerkTranslatorBasicInformation) =>
    (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleFieldChange(field, checked);
    };

  const handleFieldChange = (
    field: keyof ClerkTranslatorBasicInformation,
    fieldValue: string | boolean | undefined
  ) => {
    const updatedTranslatorDetails = {
      ...translator,
      [field]: fieldValue,
    };
    onDetailsChange();
    dispatch(
      updateClerkNewTranslator(updatedTranslatorDetails as ClerkNewTranslator)
    );
  };

  return (
    <ClerkTranslatorDetailsFields
      translator={translator}
      onTextFieldChange={(field: keyof ClerkTranslatorTextFields) =>
        handleTextFieldChange(field)
      }
      onComboBoxChange={(field: keyof ClerkTranslatorBasicInformation) =>
        handleComboBoxChange(field)
      }
      onCheckBoxChange={(field: keyof ClerkTranslatorBasicInformation) =>
        handleCheckBoxChange(field)
      }
      editDisabled={false}
      showFieldErrorBeforeChange={false}
    />
  );
};
