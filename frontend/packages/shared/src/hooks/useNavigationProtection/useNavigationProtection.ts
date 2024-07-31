import { useCallback, useEffect } from 'react';
import { Location, unstable_useBlocker as useBlocker } from 'react-router-dom';

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

  const confirmNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [blocker]);

  const cancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      showConfirmationDialog(confirmNavigation, cancelNavigation);
    }
  }, [blocker, confirmNavigation, cancelNavigation, showConfirmationDialog]);
};
