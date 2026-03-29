const { merge } = require('webpack-merge');
const yki = require('../../../webpack.yki');
module.exports = (env) => {
  const { getDefaults } = yki(
    'yki',
    env,
    __dirname,
    4003,
    'ilmoittautuminen'
  );
  return merge([getDefaults(),{
    devServer: {
      headers: { 'Access-Control-Allow-Origin': '*' },
      // Needed to allow direct navigation to URLs where segments contain dots (eg. OIDs)
      historyApiFallback: { disableDotRule: true },
    },
  }]);
};
