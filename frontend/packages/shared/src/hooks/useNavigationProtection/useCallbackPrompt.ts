import { useCallback, useEffect, useState } from 'react';

export const useCallbackPrompt = (when: boolean, baseUrl?: string) => {

  /*
  const navigate = useNavigate();
  const location = useLocation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [blockedTransition, setBlockedTransition] = useState<
    Transition | undefined
  >(undefined);
  const [isNavigationConfirmed, setIsNavigationConfirmed] = useState(false);
  const [isWithinBaseUrl, setIsWithinBaseUrl] = useState(false);

  const confirmNavigation = useCallback(() => {
    setShowPrompt(false);
    setIsNavigationConfirmed(true);
  }, []);

  const cancelNavigation = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const handleBlockedNavigation: Blocker = useCallback(
    (nextLocation) => {
      // If navigating (PUSH) to a location within baseUrl, store the blocked location
      // , mark it within baseUrl and set it confirmed to trigger
      // useEffect below for navigation
      if (
        baseUrl &&
        nextLocation.location.pathname.includes(baseUrl) &&
        location.pathname.includes(baseUrl)
      ) {
        setIsWithinBaseUrl(true);
        setBlockedTransition(nextLocation);
        setIsNavigationConfirmed(true);

        // block the transition
        // until confirmed by user. Set showPrompt (returned from hook)
        // to true, so that a confirmation dialog can be shown.
      } else if (
        !isNavigationConfirmed &&
        nextLocation.location.pathname !== location.pathname
      ) {
        setShowPrompt(true);
        setBlockedTransition(nextLocation);
      }
    },
    [isNavigationConfirmed, location.pathname, baseUrl]
  );

  useEffect(() => {
    if (isNavigationConfirmed && blockedTransition) {
      if (isWithinBaseUrl) {
        setIsNavigationConfirmed(false);
        setIsWithinBaseUrl(false);
        navigate(blockedTransition.location.pathname);
      } else {
        navigate(blockedTransition.location.pathname);
        setIsNavigationConfirmed(false);
      }
    }
  }, [isNavigationConfirmed, blockedTransition, navigate, isWithinBaseUrl]);

  useBlocker(handleBlockedNavigation, when, baseUrl);
  */
  return { showPrompt, confirmNavigation, cancelNavigation };
};
