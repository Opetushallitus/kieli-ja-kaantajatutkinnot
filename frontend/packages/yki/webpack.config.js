const { merge } = require('webpack-merge');
const common = require('../../webpack.common');

module.exports = (env) => {
  const { getDefaults } = common('yki', env, __dirname, 4003);

  const devServer = {
    proxy: {
      '/yki/api/v1': {
        target: 'http://localhost:4003',
        router: () => 'http://localhost:8083',
      },
    },
  };

  return env.DEV_SERVER
    ? merge([getDefaults(), { devServer }])
    : merge([getDefaults()]);
};
