import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router';

import { AppStore, RootState } from 'configs/redux';
import { YkiThemeProvider } from 'ophTheme/YkiThemeProvider';
import { setupStore } from 'redux/store';

export const DefaultProviders = ({
  preloadedState = {},
  store = setupStore(preloadedState),
  children,
}: {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
  children: ReactNode;
}) => {
  // Creates router that matches every path and just renders the component under test
  const router = createBrowserRouter(
    createRoutesFromElements(<Route element={children} path="*" />),
  );

  return (
    <Provider store={store}>
      <YkiThemeProvider>
        <RouterProvider router={router} />
      </YkiThemeProvider>
    </Provider>
  );
};
