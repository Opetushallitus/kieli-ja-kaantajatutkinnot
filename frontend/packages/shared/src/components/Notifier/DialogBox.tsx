import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { Color } from '../../enums';
import { useDialog } from '../../hooks/useDialog/useDialog';
import { CustomButton } from '../CustomButton/CustomButton';
import { Text } from '../Text/Text';

import './DialogBox.scss';

export const DialogBox = () => {
  const { activeDialog, removeDialog } = useDialog();

  const handleBtnAction = (action: () => void) => {
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
          onClose={removeDialog}
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
