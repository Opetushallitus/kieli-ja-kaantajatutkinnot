import { useCallback, useEffect, useRef } from 'react';
import { Location, useBlocker } from 'react-router';

export const useNavigationProtection = (
  when: boolean,
  showConfirmationDialog: (
    confirmNavigation: () => void,
    cancelNavigation: () => void,
  ) => void,
  baseUrl?: string,
) => {
  const shouldBlock = ({
    currentLocation,
    nextLocation,
  }: {
    currentLocation: Location;
    nextLocation: Location;
  }): boolean => {
    if (baseUrl) {
      return !!(
        when &&
        baseUrl &&
        !nextLocation.pathname.includes(baseUrl) &&
        currentLocation.pathname !== nextLocation.pathname
      );
    } else {
      return !!(when && currentLocation.pathname !== nextLocation.pathname);
    }
  };

  const blocker = useBlocker(shouldBlock);

  const blockerRef = useRef(blocker);

  useEffect(() => {
    blockerRef.current = blocker;
  }, [blocker]);

  const confirmNavigation = useCallback(() => {
    if (blockerRef.current.state === 'blocked') {
      blockerRef.current.proceed?.();
    }
  }, []);

  const cancelNavigation = useCallback(() => {
    if (blockerRef.current.state === 'blocked') {
      blockerRef.current.reset?.();
    }
  }, []);

  const showConfirmationDialogRef = useRef(showConfirmationDialog);

  useEffect(() => {
    showConfirmationDialogRef.current = showConfirmationDialog;
  }, [showConfirmationDialog]);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      showConfirmationDialogRef.current(confirmNavigation, cancelNavigation);
    }
  }, [blocker, confirmNavigation, cancelNavigation]);
};
