import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { APIResponseStatus, Duration, Severity } from 'shared/enums';
import { ComboBoxOption } from 'shared/interfaces';

import { ControlButtons } from 'components/clerkInterpreter/overview/ClerkInterpreterDetailsControlButtons';
import { ClerkInterpreterDetailsFields } from 'components/clerkInterpreter/overview/ClerkInterpreterDetailsFields';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { UIMode } from 'enums/app';
import { AreaOfOperation } from 'enums/clerkInterpreter';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  ClerkInterpreter,
  INTERPRETER_DEFAULT_VALUES,
} from 'interfaces/clerkInterpreter';
import {
  resetClerkInterpreterDetailsUpdate,
  updateClerkInterpreterDetails,
} from 'redux/reducers/clerkInterpreterOverview';
import { showNotifierToast } from 'redux/reducers/notifier';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';
import { NotifierUtils } from 'utils/notifier';

const getAreaOfOperation = (regions: Array<string> = []) => {
  return regions.length > 0 ? AreaOfOperation.Regions : AreaOfOperation.All;
};

export const ClerkInterpreterDetails = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { interpreter, interpreterDetailsStatus } = useAppSelector(
    clerkInterpreterOverviewSelector
  );

  const interpreterDetailsDefaultValues = useMemo(() => {
    if (!interpreter) {
      return {} as ClerkInterpreter;
    }

    return {
      ...INTERPRETER_DEFAULT_VALUES,
      ...interpreter,
    };
  }, [interpreter]);

  // Local State
  const [interpreterDetails, setInterpreterDetails] = useState(
    interpreterDetailsDefaultValues
  );
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const [areaOfOperation, setAreaOfOperation] = useState(
    getAreaOfOperation(interpreter?.regions)
  );
  const isViewMode = currentUIMode !== UIMode.EditInterpreterDetails;
  const resetLocalInterpreterDetails = useCallback(() => {
    setInterpreterDetails(interpreterDetailsDefaultValues);
    setAreaOfOperation(
      getAreaOfOperation(interpreterDetailsDefaultValues?.regions)
    );
  }, [interpreterDetailsDefaultValues]);

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview',
  });

  const resetToInitialState = useCallback(() => {
    dispatch(resetClerkInterpreterDetailsUpdate());
    resetLocalInterpreterDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [dispatch, resetLocalInterpreterDetails]);

  useEffect(() => {
    if (
      interpreterDetailsStatus === APIResponseStatus.Success &&
      currentUIMode === UIMode.EditInterpreterDetails
    ) {
      const toast = NotifierUtils.createNotifierToast(
        Severity.Success,
        t('toasts.updated'),
        Duration.Short
      );
      dispatch(showNotifierToast(toast));
      resetToInitialState();
    } else if (
      interpreterDetailsStatus === APIResponseStatus.Cancelled &&
      currentUIMode === UIMode.EditInterpreterDetails
    ) {
      // Flow was reset through the cancel dialog -> reset UI state.
      resetToInitialState();
    }
  }, [
    currentUIMode,
    dispatch,
    resetToInitialState,
    t,
    interpreterDetailsStatus,
  ]);

  useEffect(() => {
    setAreaOfOperation(getAreaOfOperation(interpreter?.regions));
  }, [interpreter?.regions]);

  const handleInterpreterDetailsChange =
    (field: keyof ClerkInterpreter) =>
    (
      eventOrValue:
        | ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
        | ComboBoxOption[]
    ) => {
      let fieldValue;
      let updatedInterpreterDetails;

      if (Array.isArray(eventOrValue)) {
        // from Region ComboBox[]
        updatedInterpreterDetails = {
          ...interpreterDetails,
          [field]: eventOrValue.map((value) => value.value),
        };
      } else if (
        'checked' in eventOrValue.target &&
        eventOrValue.target.hasOwnProperty('checked')
      ) {
        // from Checkbox toggle
        updatedInterpreterDetails = {
          ...interpreterDetails,
          [field]: eventOrValue.target.checked,
        };
      } else {
        // from TextField ChangeEvent
        fieldValue = eventOrValue.target.value;
        updatedInterpreterDetails = {
          ...interpreterDetails,
          [field]: fieldValue,
        };
      }
      setHasLocalChanges(true);
      setInterpreterDetails(updatedInterpreterDetails as ClerkInterpreter);
    };

  const onSave = () => {
    dispatch(
      updateClerkInterpreterDetails(interpreterDetails as ClerkInterpreter)
    );
  };

  const onEdit = () => {
    resetLocalInterpreterDetails();
    setCurrentUIMode(UIMode.EditInterpreterDetails);
  };

  const onCancel = () => {
    resetToInitialState();
  };
  useNavigationProtection(hasLocalChanges);

  const hasRequiredDetails =
    !!interpreterDetails?.firstName && !!interpreterDetails.lastName;

  return (
    <ClerkInterpreterDetailsFields
      interpreter={interpreterDetails}
      areaOfOperation={areaOfOperation}
      setAreaOfOperation={setAreaOfOperation}
      onFieldChange={(field: keyof ClerkInterpreter) =>
        handleInterpreterDetailsChange(field)
      }
      isViewMode={isViewMode}
      isIndividualisedInterpreter={interpreter?.isIndividualised}
      topControlButtons={
        <ControlButtons
          onCancel={onCancel}
          onEdit={onEdit}
          onSave={onSave}
          isViewMode={isViewMode}
          hasRequiredDetails={hasRequiredDetails}
        />
      }
      displayFieldErrorBeforeChange={true}
    />
  );
};
