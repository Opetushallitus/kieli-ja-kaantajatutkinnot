import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { NotifierContextProvider, StyleCacheProvider } from 'shared/components';

import { initI18n } from 'configs/i18n';
import { theme } from 'configs/materialUI';
import store from 'redux/store';
import { AppRouter } from 'routers/AppRouter';

import 'styles/styles.scss';

// Initialize I18next
initI18n();

export const App = () => (
  <Provider store={store}>
    <StyleCacheProvider appName="otr">
      <ThemeProvider theme={theme}>
        <NotifierContextProvider>
          <AppRouter />
        </NotifierContextProvider>
      </ThemeProvider>
    </StyleCacheProvider>
  </Provider>
);
