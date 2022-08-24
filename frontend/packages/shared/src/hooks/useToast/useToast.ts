import { useContext } from 'react';

import { NotifierContext } from '../../components/Notifier/NotifierContextProvider';
import { Duration, NotifierTypes, Severity } from '../../enums';
import { Toast } from '../../interfaces/notifier';

interface ShowToastProps {
  severity: Severity;
  description: string;
  timeOut?: number;
  action?: () => void;
}

export const useToast = () => {
  const notifierCtx = useContext(NotifierContext);

  const showToast = ({
    severity,
    description,
    timeOut = Duration.Medium,
    action,
  }: ShowToastProps) => {
    const toast: Toast = {
      type: NotifierTypes.Toast,
      severity,
      description,
      timeOut,
      action,
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
