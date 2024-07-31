import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useEffect, useRef } from 'react';

import { Color } from '../../enums';
import { useDialog } from '../../hooks/useDialog/useDialog';
import { CustomButton } from '../CustomButton/CustomButton';
import { Text } from '../Text/Text';

import './DialogBox.scss';

export const DialogBox = () => {
  const { activeDialog, removeDialog } = useDialog();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeDialog) {
      const dialogContainer = dialogRef.current;

      if (dialogContainer) {
        const dialog = dialogContainer.querySelector('[role="dialog"]');
        if (dialog instanceof HTMLDivElement) {
          dialog.focus();
        }
      }
    }
  }, [activeDialog]);

  const handleClose = () => {
    if (activeDialog?.onClose) {
      activeDialog.onClose();
    }

    removeDialog();
  };

  const handleBtnAction = (action?: () => void) => {
    if (action) {
      action();
    }
    removeDialog();
  };

  return (
    <>
      {activeDialog && (
        <Dialog
          className={`dialog-box--${activeDialog.severity}`}
          open={!!activeDialog}
          onClose={handleClose}
          PaperProps={{ 'aria-modal': true }}
          ref={dialogRef}
        >
          <DialogTitle>{activeDialog.title}</DialogTitle>
          <DialogContent>
            <>
              {activeDialog.content}
              {activeDialog.description ? (
                <Text>{activeDialog.description}</Text>
              ) : null}
            </>
          </DialogContent>
          <DialogActions>
            {activeDialog.actions?.map((a, i) => (
              <CustomButton
                data-testid={a.dataTestId}
                key={i}
                variant={a.variant}
                color={a.buttonColor ?? Color.Secondary}
                onClick={() => handleBtnAction(a.action)}
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
