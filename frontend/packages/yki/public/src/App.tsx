import { Provider } from 'react-redux';
import { StyleCacheProvider } from 'shared/components';

import { initI18n } from 'configs/i18n';
import { clerkEnabled } from 'featureFlags';
import { setupStore } from 'redux/store';
import { AppRouter } from 'routers/AppRouter';

if (clerkEnabled) {
  import('styles/newStyles.scss');
} else {
  import('styles/styles.scss');
}

// Initialize I18next
initI18n();

const store = setupStore();

export const App = () => (
  <Provider store={store}>
    <StyleCacheProvider appName="yki">
      <AppRouter />
    </StyleCacheProvider>
  </Provider>
);
