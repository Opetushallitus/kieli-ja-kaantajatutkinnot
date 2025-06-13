import { isCommonAssetRequest } from 'msw';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from 'App';

async function enableMocking() {
  if (!process.env.USE_MSW) {
    return;
  }

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

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

enableMocking().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
