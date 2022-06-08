const { merge } = require('webpack-merge');
const common = require('../../webpack.common');

module.exports = (env) => {
  const { getDefaults } = common('akt', env, __dirname, 4000);

  return merge([getDefaults()]);
};
