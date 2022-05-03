import { RefObject, useCallback, useRef } from 'react';

interface Focusable {
  focus(options?: FocusOptions): void;
}

export const useFocus = <T extends Focusable>(): [RefObject<T>, () => void] => {
  const ref = useRef<T>(null);
  const setFocus = useCallback(() => {
    ref.current && ref.current.focus();
  }, [ref]);

  return [ref, setFocus];
};
