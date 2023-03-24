import { useCallback, useContext } from 'react';

import { NotifierContext } from '../../components/Notifier/NotifierContextProvider';
import { NotifierTypes, Severity } from '../../enums';
import { Dialog, DialogButtonAction } from '../../interfaces/notifier';

interface ShowDialogProps {
  title: string;
  severity: Severity;
  description?: string;
  content?: React.ReactNode;
  actions: Array<DialogButtonAction>;
  timeOut?: number;
  onClose?: () => void;
}

export const useDialog = () => {
  const { dialog, onDialogRemove, onDialogShow } = useContext(NotifierContext);

  const showDialog = useCallback(
    ({
      title,
      severity,
      description,
      content,
      actions,
      timeOut,
      onClose,
    }: ShowDialogProps) => {
      const dialog: Dialog = {
        type: NotifierTypes.Dialog,
        title,
        severity,
        description,
        content,
        actions,
        timeOut,
        onClose,
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
