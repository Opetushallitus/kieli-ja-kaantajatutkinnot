import { Blocker, Transition } from 'history';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useBlocker } from 'hooks/navigation/useBlocker';

export const useCallbackPrompt = (when: boolean) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [blockedTransition, setBlockedTransition] = useState<
    Transition | undefined
  >(undefined);
  const [isNavigationConfirmed, setIsNavigationConfirmed] = useState(false);

  const confirmNavigation = useCallback(() => {
    setShowPrompt(false);
    setIsNavigationConfirmed(true);
  }, []);

  const cancelNavigation = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const handleBlockedNavigation: Blocker = useCallback(
    (nextLocation) => {
      // If navigating to a new location, block the transition
      // until confirmed by user. Set showPrompt (returned from hook)
      // to true, so that a confirmation dialog can be shown.
      if (
        !isNavigationConfirmed &&
        nextLocation.location.pathname !== location.pathname
      ) {
        setShowPrompt(true);
        setBlockedTransition(nextLocation);
      }
    },
    [isNavigationConfirmed, location.pathname]
  );

  useEffect(() => {
    if (isNavigationConfirmed && blockedTransition) {
      navigate(blockedTransition.location.pathname);
    }
  }, [isNavigationConfirmed, blockedTransition, navigate]);

  useBlocker(handleBlockedNavigation, when);

  return { showPrompt, confirmNavigation, cancelNavigation };
};
