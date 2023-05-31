import { useEffect } from 'react';

import { useCallbackPrompt } from './useCallbackPrompt';

export const useNavigationProtection = (
  when: boolean,
  showConfirmationDialog: (
    confirmNavigation: () => void,
    cancelNavigation: () => void
  ) => void,
  baseUrl?: string
) => {
  const { showPrompt, confirmNavigation, cancelNavigation } = useCallbackPrompt(
    when,
    baseUrl
  );

  useEffect(() => {
    if (showPrompt) {
      showConfirmationDialog(confirmNavigation, cancelNavigation);
    }
  }, [showPrompt, confirmNavigation, cancelNavigation, showConfirmationDialog]);
};
