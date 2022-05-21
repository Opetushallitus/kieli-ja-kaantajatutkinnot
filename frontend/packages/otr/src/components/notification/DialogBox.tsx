import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { CustomButton, Text } from 'shared/components';
import { Color } from 'shared/enums';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { Dialog as DialogType } from 'interfaces/notifier';
import { removeNotifierDialog } from 'redux/reducers/notifier';
import { notificationSelector } from 'redux/selectors/notifier';

export const DialogBox = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { dialogs } = useAppSelector(notificationSelector);

  // State
  const [activeDialog, setActiveDialog] = useState<DialogType | undefined>(
    undefined
  );

  const handleDialogClose = (id: string) => {
    dispatch(removeNotifierDialog(id));
    setActiveDialog(undefined);
    activeDialog?.onClose && activeDialog.onClose();
  };

  const dispatchAction = (action: string | (() => void), id: string) => {
    if (typeof action === 'function') {
      action();
    }
    // else {
    //    TODO: this is not used anymore. Probably can be deleted?
    //    dispatch(executeNotifierAction(action));
    // }

    handleDialogClose(id);
  };

  useEffect(() => {
    if (dialogs?.length > 0 && !activeDialog) {
      const [dialog] = dialogs;
      setActiveDialog(dialog);
    }
  }, [activeDialog, dialogs]);

  return (
    <>
      {activeDialog && (
        <Dialog
          className={`dialog-box--${activeDialog.severity}`}
          open={!!activeDialog}
          onClose={() => handleDialogClose(activeDialog.id)}
        >
          <DialogTitle>{activeDialog.title}</DialogTitle>
          <DialogContent>
            <Text>{activeDialog.description}</Text>
          </DialogContent>
          <DialogActions>
            {activeDialog.actions?.map((a, i) => (
              <CustomButton
                data-testid={a.dataTestId}
                key={i}
                variant={a.variant}
                color={a.buttonColor ?? Color.Secondary}
                onClick={() => dispatchAction(a.action, activeDialog.id)}
              >
                {a.title}
              </CustomButton>
            ))}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
