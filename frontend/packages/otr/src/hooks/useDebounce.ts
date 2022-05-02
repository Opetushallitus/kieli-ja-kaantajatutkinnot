import { EffectCallback, useCallback, useEffect, useState } from 'react';

export const useDebounce = (delay: number) => {
  const [timerId, setTimerId] = useState<number>();

  useEffect(() => {
    return () => {
      timerId && clearTimeout(timerId);
    };
  }, [timerId]);

  const debounce = useCallback(
    (functionToBeDebounced: EffectCallback) => {
      setTimerId(
        window.setTimeout(() => {
          functionToBeDebounced();
        }, delay)
      );
    },
    [delay]
  );

  return debounce;
};
