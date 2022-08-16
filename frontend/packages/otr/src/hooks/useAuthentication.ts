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
    if (clerkUser.status === APIResponseStatus.NotStarted) {
      const isClerkURL = window.location.href.includes(AppRoutes.ClerkHomePage);

      if (isClerkURL) {
        dispatch(loadClerkUser());
      }
    }
  }, [clerkUser.status, dispatch]);

  return [clerkUser.isAuthenticated, clerkUser];
};
