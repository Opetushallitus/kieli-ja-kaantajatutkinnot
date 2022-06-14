import { useContext } from 'react';

import { NotifierContext } from '../../components/Notifier/NotifierContextProvider';
import { NotifierTypes, Severity } from '../../enums';
import { Dialog, DialogButtonAction } from '../../interfaces/notifier';

export const useDialog = () => {
  const notifierCtx = useContext(NotifierContext);

  const showDialog = (
    title: string,
    severity: Severity,
    description: string,
    actions: Array<DialogButtonAction>,
    timeOut?: number | undefined
  ) => {
    const dialog: Dialog = {
      type: NotifierTypes.Dialog,
      title,
      severity,
      description,
      actions,
      timeOut,
    };

    notifierCtx?.onDialogShow(dialog);
  };

  const removeDialog = () => {
    notifierCtx?.onDialogRemove();
  };

  return {
    activeDialog: notifierCtx?.dialog,
    showDialog,
    removeDialog,
  };
};
