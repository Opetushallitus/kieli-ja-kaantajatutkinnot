import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { APIResponseStatus, Duration, Severity, Variant } from 'shared/enums';
import { ComboBoxOption } from 'shared/interfaces';

import { ControlButtons } from 'components/clerkInterpreter/overview/ClerkInterpreterDetailsControlButtons';
import { ClerkInterpreterDetailsFields } from 'components/clerkInterpreter/overview/ClerkInterpreterDetailsFields';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { UIMode } from 'enums/app';
import { AreaOfOperation } from 'enums/clerkInterpreter';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import {
  resetClerkInterpreterDetailsUpdate,
  updateClerkInterpreterDetails,
} from 'redux/reducers/clerkInterpreterOverview';
import { showNotifierDialog, showNotifierToast } from 'redux/reducers/notifier';
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

  // Local State
  const [interpreterDetails, setInterpreterDetails] = useState(interpreter);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const [areaOfOperation, setAreaOfOperation] = useState(
    getAreaOfOperation(interpreter?.regions)
  );
  const isViewMode = currentUIMode !== UIMode.EditInterpreterDetails;
  const resetLocalInterpreterDetails = useCallback(() => {
    setInterpreterDetails(interpreter);
    setAreaOfOperation(getAreaOfOperation(interpreter?.regions));
  }, [interpreter]);

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview',
  });
  const translateCommon = useCommonTranslation();

  const openCancelDialog = () => {
    const dialog = NotifierUtils.createNotifierDialog(
      t('interpreterDetails.cancelUpdateDialog.title'),
      Severity.Info,
      t('interpreterDetails.cancelUpdateDialog.description'),
      [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
          action: () => undefined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => resetToInitialState(),
        },
      ]
    );
    dispatch(showNotifierDialog(dialog));
  };

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
    if (!hasLocalChanges) {
      resetToInitialState();
    } else {
      openCancelDialog();
    }
  };
  useNavigationProtection(hasLocalChanges);

  const hasRequiredDetails =
    !!interpreterDetails?.firstName &&
    !!interpreterDetails.lastName &&
    !!interpreterDetails.nickName;

  return (
    <ClerkInterpreterDetailsFields
      interpreter={interpreterDetails}
      areaOfOperation={areaOfOperation}
      setAreaOfOperation={setAreaOfOperation}
      onFieldChange={(field: keyof ClerkInterpreter) =>
        handleInterpreterDetailsChange(field)
      }
      isViewMode={isViewMode}
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
