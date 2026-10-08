import { AppBar, Toolbar } from '@mui/material';
import { ReactNode, useCallback, useMemo } from 'react';

import { useResizeObserver } from '../../hooks';
import { MobileAppBarState } from '../../interfaces';

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
  const allOrders = useMemo(() => Object.keys(state), [state]);

  const onResize = useCallback(
    (target: HTMLDivElement) => {
      const rect = target.getBoundingClientRect();
      setState(order, rect.height);
    },
    [order, setState],
  );

  const ref = useResizeObserver(onResize);

  const isLastInOrder = order === parseInt(allOrders[allOrders.length - 1]);
  const margin =
    order === 1
      ? { margin: '1.5rem 0 0 0' }
      : isLastInOrder
        ? { margin: '0 0 1.5rem 0' }
        : { margin: 0 };

  const bottom = `${allOrders
    .slice(order)
    .reduce((prev, curr) => prev + state[curr], 0)}px`;

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
