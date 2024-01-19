import { ChangeEvent, useState } from 'react';
import { ComboBoxOption } from 'shared/interfaces';

import { ClerkInterpreterDetailsFields } from 'components/clerkInterpreter/overview/ClerkInterpreterDetailsFields';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { ClerkNewInterpreter } from 'interfaces/clerkNewInterpreter';
import { updateClerkNewInterpreter } from 'redux/reducers/clerkNewInterpreter';
import { RegionUtils } from 'utils/region';

export const ClerkNewInterpreterDetails = ({
  interpreter,
  onDetailsChange,
}: {
  interpreter: ClerkNewInterpreter;
  onDetailsChange: () => void;
}) => {
  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkNewInterpreterDetails',
  });

  // Local state
  const [areaOfOperation, setAreaOfOperation] = useState(
    RegionUtils.getAreaOfOperation(interpreter.regions),
  );

  const dispatch = useAppDispatch();

  const handleDetailsChange =
    (field: keyof ClerkNewInterpreter) =>
    (
      eventOrValue:
        | ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
        | ComboBoxOption[],
    ) => {
      let fieldValue;
      let updatedInterpreterDetails;

      if (Array.isArray(eventOrValue)) {
        // from Region ComboBox[]
        updatedInterpreterDetails = {
          ...interpreter,
          [field]: eventOrValue.map((value) => value.value),
        };
      } else if (
        'checked' in eventOrValue.target &&
        eventOrValue.target.hasOwnProperty('checked')
      ) {
        // from Checkbox toggle
        updatedInterpreterDetails = {
          ...interpreter,
          [field]: eventOrValue.target.checked,
        };
      } else {
        // from TextField ChangeEvent
        fieldValue = eventOrValue.target.value;
        updatedInterpreterDetails = {
          ...interpreter,
          [field]: fieldValue,
        };
      }
      onDetailsChange();
      dispatch(updateClerkNewInterpreter(updatedInterpreterDetails));
    };

  const title = interpreter.onrId
    ? t('title.existingPerson')
    : t('title.newPerson');

  return (
    <ClerkInterpreterDetailsFields
      title={title}
      interpreterBasicInformation={interpreter}
      isPersonalInformationIndividualised={interpreter.isIndividualised}
      isAddressIndividualised={interpreter.hasIndividualisedAddress}
      areaOfOperation={areaOfOperation}
      setAreaOfOperation={setAreaOfOperation}
      onFieldChange={(field) => handleDetailsChange(field)}
      isViewMode={false}
      showFieldErrorBeforeChange={false}
    />
  );
};
