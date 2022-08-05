const { merge } = require('webpack-merge');
const common = require('../../webpack.common');

module.exports = (env) => {
  const { getDefaults } = common('otr', env, __dirname, 4001);

  return merge([getDefaults()]);
};
