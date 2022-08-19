import { useEffect } from 'react';
import { APIResponseStatus } from 'shared/enums';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadClerkUser } from 'redux/reducers/clerkUser';
import { clerkUserSelector } from 'redux/selectors/clerkUser';

export const useAuthentication = () => {
  const dispatch = useAppDispatch();
  const clerkUser = useAppSelector(clerkUserSelector);

  const activeURL = window.location.href;
  const isClerkURL = activeURL.includes(AppRoutes.ClerkHomePage);

  useEffect(() => {
    if (clerkUser.status === APIResponseStatus.NotStarted) {
      if (isClerkURL) {
        dispatch(loadClerkUser());
      }
    }
  }, [clerkUser.status, isClerkURL, dispatch]);

  return [clerkUser.isAuthenticated, isClerkURL];
};
