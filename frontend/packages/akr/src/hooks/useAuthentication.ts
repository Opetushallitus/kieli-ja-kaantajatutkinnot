import { useEffect } from 'react';
import { APIResponseStatus } from 'shared/enums';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadClerkUser } from 'redux/reducers/clerkUser';
import { clerkUserSelector } from 'redux/selectors/clerkUser';

export const useAuthentication = () => {
  // Redux
  const dispatch = useAppDispatch();
  const clerkUser = useAppSelector(clerkUserSelector);

  useEffect(() => {
    const activeURL = window.location.href;
    const clerkURL = AppRoutes.ClerkHomePage;

    if (clerkUser.status === APIResponseStatus.NotStarted) {
      if (activeURL.includes(clerkURL)) {
        dispatch(loadClerkUser());
      }
    }
  }, [clerkUser.status, dispatch]);

  return [clerkUser.isAuthenticated, clerkUser];
};
