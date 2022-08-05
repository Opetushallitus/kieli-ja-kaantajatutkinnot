import webpack from '@cypress/webpack-preprocessor';
import { defineConfig } from 'cypress';

// eslint-disable-next-line no-restricted-imports
import webpackConfigs from './webpack.config';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4001',
    video: false,
    defaultCommandTimeout: 15000,
    chromeWebSecurity: false,
    retries: 1,
    fixturesFolder: './src/tests/cypress/fixtures/json',
    screenshotsFolder: './src/tests/cypress/screenshots',
    videosFolder: './src/tests/cypress/videos',
    downloadsFolder: './src/tests/cypress/downloads',
    supportFile: './src/tests/cypress/support/index.ts',
    specPattern: './src/tests/cypress/integration/**/*.spec.{js,jsx,ts,tsx}',
    setupNodeEvents(on) {
      const options = {
        webpackOptions: webpackConfigs({ cypress: true }),
      };

      // @ts-expect-error: options are compatible with webpackOptions
      on('file:preprocessor', webpack(options));
    },
  },
});
