const { merge } = require('webpack-merge');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');

const common = require('../../webpack.common');

module.exports = (env) => {
  const { getMode, getEntry, getModules } = common('shared', env, __dirname);

  return merge([
    getMode(),
    getEntry(),
    getModules(),
    {
      plugins: [
        new ESLintPlugin({
          extensions: ['ts', 'tsx'],
        }),
        new StylelintPlugin(),
      ],
    },
    {
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
        alias: {
          public: path.resolve(__dirname, 'public/'),
        },
      },
    },
  ]);
};
