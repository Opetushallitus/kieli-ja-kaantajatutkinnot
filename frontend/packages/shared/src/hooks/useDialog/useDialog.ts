import { useCallback, useContext } from 'react';

import { NotifierContext } from '../../components/Notifier/NotifierContextProvider';
import { NotifierTypes, Severity } from '../../enums';
import { Dialog, DialogButtonAction } from '../../interfaces/notifier';

interface ShowDialogProps {
  title: string;
  severity: Severity;
  description: string;
  actions: Array<DialogButtonAction>;
  timeOut?: number;
}

export const useDialog = () => {
  const { dialog, onDialogRemove, onDialogShow } = useContext(NotifierContext);

  const showDialog = useCallback(
    ({ title, severity, description, actions, timeOut }: ShowDialogProps) => {
      const dialog: Dialog = {
        type: NotifierTypes.Dialog,
        title,
        severity,
        description,
        actions,
        timeOut,
      };

      onDialogShow(dialog);
    },
    [onDialogShow]
  );

  const removeDialog = useCallback(() => {
    onDialogRemove();
  }, [onDialogRemove]);

  return {
    activeDialog: dialog,
    showDialog,
    removeDialog,
  };
};
