const { merge } = require('webpack-merge');
const common = require('../../webpack.common');

module.exports = (env) => {
  const { getDefaults } = common('otr', env, __dirname);

  return merge([getDefaults()]);
};
