const { merge } = require('webpack-merge');
const common = require('../../webpack.common');
// Draft
module.exports = (env) => {
  const { getDefaults } = common('otr', env, __dirname, 4001);

  return merge([getDefaults()]);
};
