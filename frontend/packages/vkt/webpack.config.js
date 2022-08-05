const { merge } = require('webpack-merge');
const common = require('../../webpack.common');
// Draft
module.exports = (env) => {
  const { getDefaults } = common('vkt', env, __dirname, 4002);

  return merge([getDefaults()]);
};
