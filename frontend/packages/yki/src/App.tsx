import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { StyleCacheProvider } from 'shared/components';
import { theme } from 'shared/configs';

import { initI18n } from 'configs/i18n';
import { setupStore } from 'redux/store';
import { AppRouter } from 'routers/AppRouter';

import 'styles/styles.scss';

// Initialize I18next
initI18n();

export const App = () => (
  <Provider store={setupStore()}>
    <StyleCacheProvider appName="yki">
      <ThemeProvider theme={theme}>
        <AppRouter />
      </ThemeProvider>
    </StyleCacheProvider>
  </Provider>
);
