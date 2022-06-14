import { Alert, Snackbar } from '@mui/material';

import { useToast } from '../../hooks/useToast/useToast';

export const Toast = () => {
  const { activeToast, removeToast } = useToast();

  return (
    <>
      {activeToast && (
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          open={!!activeToast}
          autoHideDuration={activeToast.timeOut}
          onClose={removeToast}
        >
          <Alert
            data-testid="toast-notification"
            variant={'filled'}
            onClose={removeToast}
            severity={activeToast.severity}
          >
            {activeToast.description}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};
