import { useContext } from 'react';

import { NotifierContext } from '../../components/Notifier/NotifierContextProvider';
import { Duration, NotifierTypes, Severity } from '../../enums';
import { Toast } from '../../interfaces/notifier';

export const useToast = () => {
  const notifierCtx = useContext(NotifierContext);

  const showToast = (
    severity: Severity,
    description: string,
    timeOut: number | undefined = Duration.Medium
  ) => {
    const toast: Toast = {
      type: NotifierTypes.Toast,
      severity,
      description,
      timeOut,
    };

    notifierCtx?.onToastShow(toast);
  };

  const removeToast = () => {
    notifierCtx?.onToastRemove();
  };

  return {
    activeToast: notifierCtx?.toast,
    showToast,
    removeToast,
  };
};
