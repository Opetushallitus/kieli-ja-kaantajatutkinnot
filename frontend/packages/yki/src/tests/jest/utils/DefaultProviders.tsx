import { PreloadedState } from '@reduxjs/toolkit';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

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
  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
};
