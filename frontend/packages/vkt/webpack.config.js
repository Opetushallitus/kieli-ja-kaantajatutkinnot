const { merge } = require('webpack-merge');
const common = require('../../webpack.common');

module.exports = (env) => {
  const { getDefaults } = common('vkt', env, __dirname, 4002);

  return merge([
    getDefaults(),
    {
      devServer: {
        headers: { 'Access-Control-Allow-Origin': '*' },
        // Needed to allow direct navigation to URLs where segments contain dots (eg. OIDs)
        historyApiFallback: { disableDotRule: true },
      },
    },
  ]);
};
