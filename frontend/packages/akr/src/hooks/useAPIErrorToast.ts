import { useEffect } from 'react';
import { Duration, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { resetAPIError } from 'redux/reducers/APIError';
import { APIErrorSelector } from 'redux/selectors/APIError';

export const useAPIErrorToast = () => {
  const dispatch = useAppDispatch();
  const errorMessage = useAppSelector(APIErrorSelector).message;
  const { showToast } = useToast();

  useEffect(() => {
    if (errorMessage) {
      showToast({
        severity: Severity.Error,
        description: errorMessage,
        timeOut: Duration.Medium,
        action: () => dispatch(resetAPIError()),
      });
    }
  }, [errorMessage, dispatch, showToast]);
};
