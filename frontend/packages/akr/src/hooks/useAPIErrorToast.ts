import { useEffect } from 'react';
import { Duration, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { clearAPIError } from 'redux/reducers/APIError';
import { APIErrorSelector } from 'redux/selectors/APIError';

export const useAPIErrorToast = () => {
  const dispatch = useAppDispatch();
  const currentError = useAppSelector(APIErrorSelector).currentError;
  const { showToast } = useToast();
  useEffect(() => {
    if (currentError) {
      showToast({
        severity: Severity.Error,
        description: currentError,
        timeOut: Duration.Medium,
        action: () => dispatch(clearAPIError()),
      });
    }
  }, [currentError, dispatch, showToast]);
};
