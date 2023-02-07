const { merge } = require('webpack-merge');
const common = require('../../webpack.common');

module.exports = (env) => {
  const { getDefaults } = common('yki', env, __dirname, 4003);

  return merge([getDefaults()]);
};
