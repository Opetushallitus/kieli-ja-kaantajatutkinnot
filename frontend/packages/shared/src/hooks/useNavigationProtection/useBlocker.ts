import { Blocker, History, Transition } from 'history';
import { useContext, useEffect } from 'react';
import { UNSAFE_NavigationContext } from 'react-router';

// This hook is introduced here to work around the removal of the useBlocker hook
// from react-router v6 itself.
// Revisit or ideally remove altogether this implementation once the feature gets
// added back to a recent version of react-router v6.
// For reference, see the issue at https://github.com/remix-run/react-router/issues/8139

export const useBlocker = (blocker: Blocker, when: boolean) => {
  const navigator = useContext(UNSAFE_NavigationContext).navigator as History;

  useEffect(() => {
    if (when) {
      const unblock = navigator.block((tx: Transition) => {
        const autoUnblockingTx = {
          ...tx,
          retry() {
            unblock();
            tx.retry();
          },
        };
        blocker(autoUnblockingTx);
      });

      return unblock;
    }
  }, [navigator, blocker, when]);
};
