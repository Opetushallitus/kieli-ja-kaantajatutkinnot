import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { APIResponseStatus, Severity } from 'shared/enums';

import { ControlButtons } from 'components/clerkInterpreter/overview/ClerkInterpreterDetailsControlButtons';
import { ClerkInterpreterDetailsFields } from 'components/clerkInterpreter/overview/ClerkInterpreterDetailsFields';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { UIMode } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import {
  resetClerkInterpreterDetailsUpdate,
  updateClerkInterpreterDetails,
} from 'redux/reducers/clerkInterpreterOverview';
import { showNotifierToast } from 'redux/reducers/notifier';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';
import { NotifierUtils } from 'utils/notifier';

export const ClerkInterpreterDetails = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { interpreter, interpreterDetailsUpdateStatus } = useAppSelector(
    clerkInterpreterOverviewSelector
  );

  // Local State
  const [interpreterDetails, setInterpreterDetails] = useState(interpreter);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const isViewMode = currentUIMode !== UIMode.EditInterpreterDetails;
  const resetLocalInterpreterDetails = useCallback(() => {
    setInterpreterDetails(interpreter);
  }, [interpreter]);

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview',
  });

  const resetToInitialState = useCallback(() => {
    resetLocalInterpreterDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [resetLocalInterpreterDetails]);

  useEffect(() => {
    if (
      interpreterDetailsUpdateStatus === APIResponseStatus.Success &&
      currentUIMode === UIMode.EditInterpreterDetails
    ) {
      const toast = NotifierUtils.createNotifierToast(
        Severity.Success,
        t('toasts.updated')
      );
      dispatch(showNotifierToast(toast));
      dispatch(resetClerkInterpreterDetailsUpdate);
      setCurrentUIMode(UIMode.View);
    } else if (
      interpreterDetailsUpdateStatus === APIResponseStatus.Cancelled &&
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
    interpreterDetailsUpdateStatus,
  ]);

  const handleInterpreterDetailsChange =
    (field: keyof ClerkInterpreter) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const fieldValue = event.target.value;
      const updatedInterpreterDetails = {
        ...interpreterDetails,
        [field]: fieldValue,
      };
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

  return (
    <ClerkInterpreterDetailsFields
      interpreter={interpreterDetails}
      onFieldChange={(field: keyof ClerkInterpreter) =>
        handleInterpreterDetailsChange(field)
      }
      editDisabled={isViewMode}
      topControlButtons={
        <ControlButtons
          onCancel={onCancel}
          onEdit={onEdit}
          onSave={onSave}
          isViewMode={isViewMode}
        />
      }
      displayFieldErrorBeforeChange={true}
    />
  );
};
