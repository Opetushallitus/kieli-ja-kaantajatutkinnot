const { merge } = require('webpack-merge');
const common = require('../../webpack.common');

module.exports = (env) => {
  const {
    getMode,
    getEntry,
    getOutput,
    getPlugins,
    getModules,
    getDevTool,
    getResolve,
    getStats,
    getDevServer,
  } = common('akt', env, __dirname);

  return merge([
    getMode(),
    getEntry(),
    getOutput(),
    getPlugins(),
    getModules(),
    getResolve(),
    getDevTool(),
    getStats(),
    getDevServer(),
  ]);
};
