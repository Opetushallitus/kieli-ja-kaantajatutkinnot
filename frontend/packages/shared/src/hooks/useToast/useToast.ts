import { useCallback, useContext } from 'react';

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
  const { onToastRemove, onToastShow, toast } = useContext(NotifierContext);

  const showToast = useCallback(
    ({
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
      onToastShow(toast);
    },
    [onToastShow]
  );

  const removeToast = useCallback(() => {
    onToastRemove();
  }, [onToastRemove]);

  return {
    activeToast: toast,
    showToast,
    removeToast,
  };
};
