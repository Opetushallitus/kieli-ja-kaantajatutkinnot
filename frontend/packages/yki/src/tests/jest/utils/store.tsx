import type { PreloadedState } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { AppStore, RootState } from 'configs/redux';
import { setupStore } from 'redux/store';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren<object>): JSX.Element {
    return (
      <DefaultProviders preloadedState={preloadedState}>
        {children}
      </DefaultProviders>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
