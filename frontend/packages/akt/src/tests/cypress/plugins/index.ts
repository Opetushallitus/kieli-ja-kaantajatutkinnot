import webpack from '@cypress/webpack-preprocessor';

// eslint-disable-next-line no-restricted-imports
import webpackConfigs from '../../../../webpack.config';

export default (on) => {
  const options = {
    webpackOptions: webpackConfigs({ cypress: true }),
    watchOptions: {},
  };

  on('file:preprocessor', webpack(options));
};
