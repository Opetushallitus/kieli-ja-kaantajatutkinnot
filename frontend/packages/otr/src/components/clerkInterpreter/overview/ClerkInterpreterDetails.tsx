import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { APIResponseStatus, Severity } from 'shared/enums';

import { ControlButtons } from 'components/clerkInterpreter/overview/ClerkInterpreterDetailsControlButtons';
import { ClerkTranslatorDetailsFields } from 'components/clerkInterpreter/overview/ClerkInterpreterDetailsFields';
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
  const { interpreter, interpreterDetailsStatus } = useAppSelector(
    clerkInterpreterOverviewSelector
  );

  // Local State
  const [interpreterDetails, setTranslatorDetails] = useState(interpreter);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const isViewMode = currentUIMode !== UIMode.EditInterpreterDetails;
  const resetLocalTranslatorDetails = useCallback(() => {
    setTranslatorDetails(interpreter);
  }, [interpreter]);

  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview',
  });

  const resetToInitialState = useCallback(() => {
    dispatch(resetClerkInterpreterDetailsUpdate);
    resetLocalTranslatorDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [dispatch, resetLocalTranslatorDetails]);

  useEffect(() => {
    if (
      interpreterDetailsStatus === APIResponseStatus.Success &&
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

  const handleTranslatorDetailsChange =
    (field: keyof ClerkInterpreter) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const fieldValue = event.target.value;
      const updatedTranslatorDetails = {
        ...interpreterDetails,
        [field]: fieldValue,
      };
      setHasLocalChanges(true);
      setTranslatorDetails(updatedTranslatorDetails as ClerkInterpreter);
    };

  const onSave = () => {
    dispatch(
      updateClerkInterpreterDetails(interpreterDetails as ClerkInterpreter)
    );
  };

  const onEdit = () => {
    resetLocalTranslatorDetails();
    setCurrentUIMode(UIMode.EditInterpreterDetails);
  };

  // const openCancelDialog = () => {
  //   const dialog = NotifierUtils.createNotifierDialog(
  //     t('interpreterDetails.cancelUpdateDialog.title'),
  //     Severity.Info,
  //     t('interpreterDetails.cancelUpdateDialog.description'),
  //     [
  //       {
  //         title: translateCommon('back'),
  //         variant: Variant.Outlined,
  //         action: NOTIFIER_ACTION_DO_NOTHING,
  //       },
  //       {
  //         title: translateCommon('yes'),
  //         variant: Variant.Contained,
  //         action: NOTIFIER_ACTION_CLERK_TRANSLATOR_DETAILS_CANCEL_UPDATE,
  //       },
  //     ]
  //   );
  //   dispatch(showNotifierDialog(dialog));
  // };

  const onCancel = () => {
    if (!hasLocalChanges) {
      resetToInitialState();
    } else {
      // TODO
      // openCancelDialog();
    }
  };
  useNavigationProtection(hasLocalChanges);

  return (
    <ClerkTranslatorDetailsFields
      interpreter={interpreterDetails}
      onFieldChange={(field: keyof ClerkInterpreter) =>
        handleTranslatorDetailsChange(field)
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
