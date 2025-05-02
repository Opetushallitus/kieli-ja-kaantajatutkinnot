import { isCommonAssetRequest } from 'msw';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from 'App';

async function enableMocking() {
  if (!REACT_ENV_PRODUCTION && process.env.USE_MSW === 'true') {
    const { worker } = await import('./tests/msw/browser');

    // `worker.start()` returns a Promise that resolves
    // once the Service Worker is up and ready to intercept requests.
    return worker.start({
      onUnhandledRequest(request, print) {
        // Ignore common static asset requests
        // (i.e. tap into the default behavior).
        if (isCommonAssetRequest(request)) {
          return;
        }

        // Otherwise, print a warning.
        print.warning();
      },
    });
  }

  return;
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
enableMocking().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
