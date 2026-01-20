import { useEffect, useRef } from 'react';

export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<() => void>();
  savedCallback.current = callback;

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => {
        if (savedCallback.current) {
          savedCallback.current();
        }
      }, delay);

      return () => clearInterval(id);
    }
  }, [delay]);
};
