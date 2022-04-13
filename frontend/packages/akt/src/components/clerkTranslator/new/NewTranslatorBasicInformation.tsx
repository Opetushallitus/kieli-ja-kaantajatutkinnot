import { ChangeEvent } from 'react';

import { ClerkTranslatorDetailsFields } from 'components/clerkTranslator/overview/ClerkTranslatorDetailsFields';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ClerkTranslatorBasicInformation } from 'interfaces/clerkTranslator';
import { updateNewClerkTranslator } from 'redux/actions/clerkNewTranslator';
import { clerkNewTranslatorSelector } from 'redux/selectors/clerkNewTranslator';

export const NewTranslatorBasicInformation = ({
  onDetailsChange,
}: {
  onDetailsChange: () => void;
}) => {
  // Redux
  const { translator } = useAppSelector(clerkNewTranslatorSelector);
  const dispatch = useAppDispatch();

  const onTranslatorDetailsChange = (
    translatorDetails: ClerkTranslatorBasicInformation
  ) => {
    onDetailsChange();
    dispatch(updateNewClerkTranslator({ ...translator, ...translatorDetails }));
  };

  const handleTranslatorDetailsChange =
    (field: keyof ClerkTranslatorBasicInformation) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const fieldValue =
        field === 'isAssuranceGiven'
          ? (event.target as HTMLInputElement).checked
          : event.target.value;
      const updatedTranslatorDetails = {
        ...translator,
        [field]: fieldValue,
      };
      onTranslatorDetailsChange(updatedTranslatorDetails);
    };

  return (
    <ClerkTranslatorDetailsFields
      translator={translator}
      onFieldChange={(field: keyof ClerkTranslatorBasicInformation) =>
        handleTranslatorDetailsChange(field)
      }
      editDisabled={false}
      displayFieldErrorBeforeChange={false}
    />
  );
};
