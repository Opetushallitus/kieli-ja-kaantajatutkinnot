import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { APIResponseStatus, Duration, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { ComboBoxOption } from 'shared/interfaces';
import { StringUtils } from 'shared/utils';

import { ControlButtons } from 'components/clerkInterpreter/overview/ClerkInterpreterDetailsControlButtons';
import { ClerkInterpreterDetailsFields } from 'components/clerkInterpreter/overview/ClerkInterpreterDetailsFields';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { UIMode } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  ClerkInterpreter,
  ClerkInterpreterBasicInformation,
} from 'interfaces/clerkInterpreter';
import {
  resetClerkInterpreterDetailsUpdate,
  updateClerkInterpreterDetails,
} from 'redux/reducers/clerkInterpreterOverview';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';
import { RegionUtils } from 'utils/region';

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
    RegionUtils.getAreaOfOperation(interpreter?.regions)
  );
  const isViewMode = currentUIMode !== UIMode.EditInterpreterDetails;
  const resetLocalInterpreterDetails = useCallback(() => {
    setInterpreterDetails(interpreter);
    setAreaOfOperation(RegionUtils.getAreaOfOperation(interpreter?.regions));
  }, [interpreter]);

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview',
  });
  const translateCommon = useCommonTranslation();

  const { showDialog } = useDialog();
  const { showToast } = useToast();

  const openCancelDialog = () => {
    showDialog({
      title: t('interpreterDetails.cancelUpdateDialog.title'),
      severity: Severity.Info,
      description: t('interpreterDetails.cancelUpdateDialog.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => resetToInitialState(),
        },
      ],
    });
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
      showToast({
        severity: Severity.Success,
        description: t('toasts.updated'),
        timeOut: Duration.Short,
      });

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
    showToast,
    t,
    interpreterDetailsStatus,
  ]);

  useEffect(() => {
    setAreaOfOperation(RegionUtils.getAreaOfOperation(interpreter?.regions));
  }, [interpreter?.regions]);

  const handleDetailsChange =
    (field: keyof ClerkInterpreterBasicInformation) =>
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
    StringUtils.isNonBlankString(interpreterDetails?.lastName) &&
    StringUtils.isNonBlankString(interpreterDetails?.firstName) &&
    StringUtils.isNonBlankString(interpreterDetails?.nickName) &&
    StringUtils.isNonBlankString(interpreterDetails?.email);

  return (
    <ClerkInterpreterDetailsFields
      interpreterBasicInformation={interpreterDetails}
      isIndividualisedInterpreter={interpreter?.isIndividualised}
      areaOfOperation={areaOfOperation}
      setAreaOfOperation={setAreaOfOperation}
      onFieldChange={(field) => handleDetailsChange(field)}
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
