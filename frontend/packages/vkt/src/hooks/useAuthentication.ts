import { useEffect } from 'react';
import { APIResponseStatus } from 'shared/enums';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadClerkUser } from 'redux/reducers/clerkUser';
import { loadPublicUser } from 'redux/reducers/publicUser';
import { clerkUserSelector } from 'redux/selectors/clerkUser';
import { publicUserSelector } from 'redux/selectors/publicUser';

export const useAuthentication = () => {
  const dispatch = useAppDispatch();
  const clerkUser = useAppSelector(clerkUserSelector);
  const publicUser = useAppSelector(publicUserSelector);

  const activeURL = window.location.href;
  const isClerkURL = activeURL.includes(AppRoutes.ClerkHomePage);
  const isPublicURL = !isClerkURL;

  useEffect(() => {
    if (clerkUser.status === APIResponseStatus.NotStarted) {
      if (isClerkURL) {
        dispatch(loadClerkUser());
      }
    }
    if (publicUser.status === APIResponseStatus.NotStarted) {
      if (isPublicURL) {
        dispatch(loadPublicUser());
      }
    }
  }, [clerkUser.status, publicUser.status, isClerkURL, isPublicURL, dispatch]);

  return {
    isAuthenticated: clerkUser.isAuthenticated,
    isClerkUI: isClerkURL,
    publicUser,
    clerkUser,
  };
};
