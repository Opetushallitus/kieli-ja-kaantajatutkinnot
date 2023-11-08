import { History } from 'history';
import { useContext, useLayoutEffect } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

export const ScrollToTop = () => {
  // FIXME: UNSAFE_NavigationContext is no longer allowed in react router 6
  /*
  const navigator = useContext(UNSAFE_NavigationContext).navigator as History;
  useLayoutEffect(() => {
    const unlisten = navigator.listen(({ action }) => {
      if (action !== 'POP') {
        window.scrollTo({ left: 0, top: 0 });
      }
    });

    return unlisten;
  }, [navigator]);
  */
  return null;
};
