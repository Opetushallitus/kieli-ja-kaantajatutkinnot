import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { APIResponseStatus } from 'shared/enums';

import {
  navigationHandled,
  resetPublicRegistration,
} from 'features/registration/redux/reducers/registrationv2';
import { stepPath } from 'features/registration/routesv2';
import {
  registrationSelector,
  useAppDispatch,
  useAppSelector,
} from 'features/registration/state/reduxv2';
export const useRegistrationStartNavigation = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { initRegistration, startNavigation } =
    useAppSelector(registrationSelector);
  useEffect(() => {
    dispatch(resetPublicRegistration());
  }, [dispatch]);
  useEffect(() => {
    const { status, examSessionId, registrationId } = initRegistration;
    if (
      startNavigation &&
      status === APIResponseStatus.Success &&
      examSessionId &&
      registrationId
    ) {
      dispatch(navigationHandled());
      navigate(stepPath('Identify', { examSessionId, registrationId }));
    }
  }, [dispatch, navigate, initRegistration, startNavigation]);
};
