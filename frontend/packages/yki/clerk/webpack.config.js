const { merge } = require('webpack-merge');
const common = require('../../../webpack.common');
module.exports = (env) => {
  const { getDefaults } = common(
    'yki', // cloud-base path for new yki clerk is '/yki/v2' and we already prefix 'yki' in the backend
    env,
    __dirname,
    4004,
    'v2/virkailija/jarjestajarekisteri',
  );
  return merge([getDefaults(),{
    devServer: {
      headers: { 'Access-Control-Allow-Origin': '*' },
      // Needed to allow direct navigation to URLs where segments contain dots (eg. OIDs)
      historyApiFallback: { disableDotRule: true },
    },
  }]);
};
