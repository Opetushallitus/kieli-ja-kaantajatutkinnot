import { useCallback, useContext } from 'react';

import { NotifierContext } from '../../components/Notifier/NotifierContextProvider';
import { Duration, NotifierTypes, Severity } from '../../enums';
import { Toast } from '../../interfaces/notifier';

interface ShowToastProps {
  severity: Severity;
  description: string;
  timeOut?: number;
  onClose?: () => void;
}

export const useToast = () => {
  const { onToastRemove, onToastShow, toast } = useContext(NotifierContext);

  const showToast = useCallback(
    ({
      severity,
      description,
      timeOut = Duration.Medium,
      onClose,
    }: ShowToastProps) => {
      const toast: Toast = {
        type: NotifierTypes.Toast,
        severity,
        description,
        timeOut,
        onClose,
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
