import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react';
import {
  LoadingProgressIndicator,
  NotifierContextProvider,
  StyleCacheProvider,
} from 'shared/components';
import { theme } from 'shared/configs';

import { initI18n } from 'configs/i18n';
import store, { persistor } from 'redux/store';
import { AppRouter } from 'routers/AppRouter';

import 'styles/styles.scss';

// Initialize I18next
initI18n();

export const App = () => (
  <Provider store={store}>
    <StyleCacheProvider appName="vkt">
      <ThemeProvider theme={theme}>
        <NotifierContextProvider>
          <PersistGate
            loading={<LoadingProgressIndicator isLoading={true} />}
            persistor={persistor}
          >
            <AppRouter />
          </PersistGate>
        </NotifierContextProvider>
      </ThemeProvider>
    </StyleCacheProvider>
  </Provider>
);
