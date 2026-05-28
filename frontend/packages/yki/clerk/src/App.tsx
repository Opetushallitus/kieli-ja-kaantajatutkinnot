import { Provider } from 'react-redux';
import { StyleCacheProvider } from 'shared/components';

import { initI18n } from 'configs/i18n';
import { setupStore } from 'redux/store';
import { AppRouter } from 'routers/AppRouter';
import { VirkailijaRaamit } from 'VirkailijaRaamit';

import 'styles/styles.scss';

// Initialize I18next
initI18n();

const store = setupStore();

const virkailijaRaamitScriptUrl =
  (window as Window & { Cypress?: unknown }).Cypress ||
  'localhost' === window.location.hostname
    ? ''
    : `${window.location.origin}/virkailija-raamit/apply-raamit.js`;

export const App = () => (
  <Provider store={store}>
    <StyleCacheProvider appName="yki">
      <VirkailijaRaamit scriptUrl={virkailijaRaamitScriptUrl} />
      <AppRouter />
    </StyleCacheProvider>
  </Provider>
);
