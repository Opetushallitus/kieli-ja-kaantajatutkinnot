import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { Text } from 'components/elements/Text';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { notificationSelector } from 'redux/selectors/notifier';
import {
  executeNotifierAction,
  removeNotifierDialog,
} from 'redux/actions/notifier';
import { Dialog as DialogType } from 'interfaces/notifier';

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
  };

  const dispatchAction = (action: string, id: string) => {
    dispatch(executeNotifierAction(action));
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
              <Button
                key={i}
                variant={a.variant}
                color="secondary"
                onClick={() => dispatchAction(a.action, activeDialog.id)}
              >
                {a.title}
              </Button>
            ))}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
