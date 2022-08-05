const { merge } = require('webpack-merge');
const common = require('../../webpack.common');
// Draft
module.exports = (env) => {
  const { getDefaults } = common('akr', env, __dirname, 4000);

  return merge([getDefaults()]);
};
