import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';

import { initI18n } from 'configs/i18n';
import { theme } from 'configs/materialUI';
import store from 'redux/store';
import { AppRouter } from 'routers/AppRouter';
import { readNonceFromMetaTag } from 'utils/csp';

import 'styles/styles.scss';

// Initialize I18next
initI18n();

const nonce = readNonceFromMetaTag();
const cache = createCache({ key: 'vkt', nonce });

export const App = () => (
  <Provider store={store}>
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <AppRouter />
      </ThemeProvider>
    </CacheProvider>
  </Provider>
);
