import { AppBar, Toolbar } from '@mui/material';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import useResizeObserver from 'hooks/useResizeObserver';
import { MobileAppBarState } from 'interfaces/mobileAppBar';

interface StackableMobileAppBarProps {
  order: number;
  children: ReactNode;
  state: MobileAppBarState;
  setState: (order: number, height: number) => void;
}

/*
  Current solution is based on assumption, that stackable AppBar do not need a shared state
  across the app but instead rely on parent state and setState function to be created
  where stackable AppBar is required.
  
  The core idea for stackable AppBar is to be able to logically place AppBars for screen readers
  to voice through the content similar to dom structure but still
  cascade them visually correctly on top of each other at the bottom of the page based on their order
  (descending)
*/
export const StackableMobileAppBar = ({
  order,
  children,
  state,
  setState,
}: StackableMobileAppBarProps) => {
  const [margin, setMargin] = useState({});
  const [bottom, setBottom] = useState('');
  const allOrders = useMemo(() => Object.keys(state), [state]);

  const onResize = useCallback(
    (target: HTMLDivElement) => {
      const rect = target.getBoundingClientRect();
      setState(order, rect.height);
    },
    [order, setState]
  );

  const ref = useResizeObserver(onResize);

  const isLastInOrder = order === parseInt(allOrders[allOrders.length - 1]);

  useEffect(() => {
    setMargin(() => {
      if (order === 1) {
        return {
          margin: '1.5rem 0 0 0',
        };
      } else if (isLastInOrder) {
        return {
          margin: '0 0 1.5rem 0',
        };
      } else {
        return {
          margin: 0,
        };
      }
    });
  }, [order, isLastInOrder, setMargin]);

  useEffect(() => {
    setBottom(() => {
      const ordersToReduce = allOrders.slice(order);

      const bottom = ordersToReduce.reduce((prev, curr) => {
        const elementHeight = state[curr];

        return prev + elementHeight;
      }, 0);

      return `${bottom}px`;
    });
  }, [state, allOrders, order, setBottom]);

  return (
    <div className="mobile">
      <AppBar
        ref={ref}
        className="mobile-app-bar"
        style={{
          bottom,
          boxShadow: isLastInOrder ? 'none' : '',
        }}
      >
        <Toolbar className="mobile-app-bar__tool-bar" style={margin}>
          {children}
        </Toolbar>
      </AppBar>
    </div>
  );
};
