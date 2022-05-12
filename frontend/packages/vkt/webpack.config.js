const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = (env) => {
  const STATIC_PATH = 'vkt/static';
  const mode = env.prod ? 'production' : 'development';

  return {
    mode,
    entry: path.join(__dirname, 'src', 'index.tsx'),
    output: {
      filename: `${STATIC_PATH}/js/bundle.js`,
      path: path.join(
        __dirname,
        '..',
        '..',
        '..',
        'backend',
        'vkt',
        'src',
        'main',
        'resources',
        'static'
      ),
    },
    plugins: [
      new CompressionPlugin({
        algorithm: 'gzip',
      }),
      new MiniCssExtractPlugin({
        filename: `${STATIC_PATH}/css/[name].css`,
      }),
      new HtmlWebpackPlugin({
        publicPath: env.prod ? '/vkt/' : '/',
        template: path.join(__dirname, 'public', 'index.html'),
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'public', 'favicon.ico'),
            to: `${STATIC_PATH}/assets/ico/[name][ext]`,
          },
        ],
      }),
      new webpack.DefinePlugin({
        REACT_ENV_PRODUCTION: JSON.stringify(Boolean(env.prod)),
      }),
      ...getESLintPlugin(mode),
      ...getStylelintPlugin(env),
    ],
    module: {
      rules: [
        {
          test: /\.[tj]sx?$/,
          loader: 'babel-loader',
          exclude: /node_modules\/(?!(shared)\/).*/,
        },
        {
          test: /\.s?css$/,
          use: [
            env.prod ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader',
          ],
          exclude: /node_modules\/(?!(shared)\/).*/,
        },
        {
          test: /\.(woff(2)?|ttf|eot)$/,
          type: 'asset/resource',
          generator: {
            filename: `${STATIC_PATH}/assets/fonts/[name][ext]`,
          },
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
      modules: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, '..', 'shared', 'src'),
        'node_modules',
      ],
      alias: {
        public: path.resolve(__dirname, 'public/'),
      },
    },
    devtool: env.prod ? 'source-map' : 'cheap-module-source-map',
    devServer: {
      open: '/vkt/etusivu',
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 4000,
      proxy: {
        '/vkt/api': env.proxy,
      },
    },
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

const getESLintPlugin = (mode) => {
  if (mode === 'development') {
    const ESLintPlugin = require('eslint-webpack-plugin');
    return [
      new ESLintPlugin({
        extensions: ['ts', 'tsx'],
      }),
    ];
  }
  return [];
};
