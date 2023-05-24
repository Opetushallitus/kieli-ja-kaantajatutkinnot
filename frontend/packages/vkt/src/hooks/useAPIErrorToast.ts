import { useEffect } from 'react';
import { Duration, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { resetAPIError } from 'redux/reducers/APIError';
import { APIErrorSelector } from 'redux/selectors/APIError';
import { NotifierUtils } from 'utils/notifier';

export const useAPIErrorToast = () => {
  const dispatch = useAppDispatch();
  const params = new URLSearchParams(window.location.search);
  const errorMessageQuery = params.get('error')
    ? NotifierUtils.getURLErrorMessage(params.get('error'))
    : null;
  const errorMessage =
    useAppSelector(APIErrorSelector).message || errorMessageQuery;
  const { showToast } = useToast();

  useEffect(() => {
    if (errorMessage) {
      showToast({
        severity: Severity.Error,
        description: errorMessage,
        timeOut: Duration.Medium,
        onClose: () => dispatch(resetAPIError()),
      });
    }
  }, [errorMessage, dispatch, showToast]);
};
