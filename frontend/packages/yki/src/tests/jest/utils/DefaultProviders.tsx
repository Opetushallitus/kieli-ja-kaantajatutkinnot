import { PreloadedState } from '@reduxjs/toolkit';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import { AppStore, RootState } from 'configs/redux';
import { setupStore } from 'redux/store';

export const DefaultProviders = ({
  preloadedState = {},
  store = setupStore(preloadedState),
  children,
}: {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
  children: ReactNode;
}) => {
  // Creates router that matches every path and just renders the component under test
  const router = createBrowserRouter(
    createRoutesFromElements(<Route element={children} path="*" />),
  );

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};
