const { merge } = require('webpack-merge');
const common = require('../../webpack.common');
const clerk = require('../../webpack.clerk');
module.exports = (env) => {
  if (env.goal === 'clerk') {
    const { getDefaults } = clerk(
      'yki',
      env,
      __dirname,
      4003,
      'ilmoittautuminen'
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
