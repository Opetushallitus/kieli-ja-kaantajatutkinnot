import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useEffect, useRef } from 'react';

import { Color } from '../../enums';
import { useWindowProperties } from '../../hooks';
import { useDialog } from '../../hooks/useDialog/useDialog';
import { CustomButton } from '../CustomButton/CustomButton';
import { Text } from '../Text/Text';

import './DialogBox.scss';

export const DialogBox = () => {
  const { activeDialog, removeDialog } = useDialog();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { isPhone } = useWindowProperties();

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
          className={`dialog-box--${activeDialog.severity} gapped`}
          open={!!activeDialog}
          onClose={handleClose}
          PaperProps={{
            'aria-modal': true,
            className: `${activeDialog.paperClassName} gapped`,
            style: {
              padding: '30px',
            },
          }}
          ref={dialogRef}
        >
          <DialogTitle className="padding-unset">
            {activeDialog.title}
          </DialogTitle>
          <DialogContent className="padding-unset">
            <>
              {activeDialog.content}
              {activeDialog.description ? (
                <Text>{activeDialog.description}</Text>
              ) : null}
            </>
          </DialogContent>
          <DialogActions
            className={[
              isPhone ? 'rows' : 'columns',
              'gapped',
              'padding-unset',
            ].join(' ')}
          >
            {activeDialog.actions?.map((a, i) => (
              <CustomButton
                data-testid={a.dataTestId}
                key={i}
                variant={a.variant}
                color={a.buttonColor ?? Color.Secondary}
                onClick={() => handleBtnAction(a.action)}
                fullWidth={isPhone}
              >
                {a.variant === 'contained' ? (
                  <span className="button-color-white">{a.title}</span>
                ) : (
                  a.title
                )}
              </CustomButton>
            ))}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
