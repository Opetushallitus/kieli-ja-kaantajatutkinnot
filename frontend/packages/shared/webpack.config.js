const path = require('path');
const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = (env) => {
  const mode = env.prod ? 'production' : 'development';

  return {
    mode,
    entry: path.join(__dirname, 'src', 'index.tsx'),
    plugins: [
      new CompressionPlugin({
        algorithm: 'gzip',
      }),
      new ESLintPlugin({
        extensions: ['ts', 'tsx'],
      }),
      new webpack.DefinePlugin({
        REACT_ENV_PRODUCTION: JSON.stringify(Boolean(env.prod)),
      }),
      ...getStylelintPlugin(env),
    ],
    module: {
      rules: [
        {
          test: /\.[tj]sx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s?css$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          exclude: /node_modules/,
        },
        {
          test: /\.svg$/,
          type: 'asset/resource',
          generator: {
            filename: `${STATIC_PATH}/assets/svg/[name][ext]`,
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      alias: {
        public: path.resolve(__dirname, 'public/'),
      },
    },
    devtool: env.prod ? 'source-map' : 'cheap-module-source-map',
    stats: 'errors-warnings',
  };
};

// Helpers
const getStylelintPlugin = (env) => {
  if (!env.isCypress) {
    const StylelintPlugin = require('stylelint-webpack-plugin');
    return [new StylelintPlugin()];
  }
  return [];
};
