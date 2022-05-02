import { Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { Notifier } from 'interfaces/notifier';
import { removeNotifierToast } from 'redux/actions/notifier';
import { notificationSelector } from 'redux/selectors/notifier';

export const Toast = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { toasts } = useAppSelector(notificationSelector);

  // State
  const [activeToast, setActiveToast] = useState<Notifier | undefined>(
    undefined
  );

  const handleToastClose = (id: string) => {
    dispatch(removeNotifierToast(id));
    setActiveToast(undefined);
  };

  useEffect(() => {
    if (toasts?.length > 0 && !activeToast) {
      const [toast] = toasts;
      setActiveToast(toast);
    }
  }, [activeToast, toasts]);

  return (
    <>
      {activeToast && (
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          open={!!activeToast}
          autoHideDuration={activeToast.timeOut}
          onClose={() => handleToastClose(activeToast.id)}
        >
          <Alert
            data-testid="toast-notification"
            variant={'filled'}
            onClose={() => handleToastClose(activeToast.id)}
            severity={activeToast.severity}
          >
            {activeToast.description}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};
