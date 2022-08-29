import { Alert, Snackbar } from '@mui/material';

import { useToast } from '../../hooks/useToast/useToast';

export const Toast = () => {
  const { activeToast, removeToast } = useToast();

  const handleClose = () => {
    if (activeToast?.onClose) {
      activeToast.onClose();
    }
    removeToast();
  };

  return (
    <>
      {activeToast && (
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          open={!!activeToast}
          autoHideDuration={activeToast.timeOut}
          onClose={handleClose}
        >
          <Alert
            data-testid="toast-notification"
            variant={'filled'}
            onClose={handleClose}
            severity={activeToast.severity}
          >
            {activeToast.description}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};
