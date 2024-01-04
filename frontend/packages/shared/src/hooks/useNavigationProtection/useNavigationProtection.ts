import { useEffect, useCallback } from 'react';
import { flushSync } from "react-dom";

import { unstable_useBlocker as useBlocker } from 'react-router-dom';

export const useNavigationProtection = (
  when: boolean,
  showConfirmationDialog: (
    confirmNavigation: () => void,
    cancelNavigation: () => void
  ) => void,
  baseUrl?: string
) => {

  const shouldBlock =
    ({ currentLocation, nextLocation, historyAction }) =>
      when &&
      !nextLocation.pathname.includes(baseUrl) &&
      currentLocation.pathname !== nextLocation.pathname;

  const blocker = useBlocker(shouldBlock);

  const confirmNavigation = useCallback(() => {
    blocker.proceed();
  }, [blocker]);

  const cancelNavigation = useCallback(() => {
    blocker.reset();
  }, [blocker]);

  useEffect(() => {
    if (blocker.state === "blocked") {
      showConfirmationDialog(confirmNavigation, cancelNavigation);
    }
  }, [blocker, confirmNavigation, cancelNavigation, showConfirmationDialog]);
};
