const { merge } = require('webpack-merge');
const common = require('../../webpack.common');
module.exports = (env) => {
  if (env.goal === 'clerk') {
    const { getDefaults } = common(
      'yki',
      env,
      __dirname,
      4004,
      'ilmoittautuminen',
      '/v2'
    );
    return merge([getDefaults()]);
  } else {
    const { getDefaults } = common(
      'yki',
      env,
      __dirname,
      4003,
      'ilmoittautuminen'
    );
    return merge([getDefaults()]);
  }
};
