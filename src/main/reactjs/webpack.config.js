const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = (env) => {
  const mode = env.prod ? 'production' : 'development';

  return {
    mode,
    entry: path.join(__dirname, '..', 'reactjs', 'src', 'index.tsx'),
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'static/js/bundle.js',
    },
    plugins: [
      new CompressionPlugin({
        algorithm: 'gzip',
      }),
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].css',
      }),
      new HtmlWebpackPlugin({
        publicPath: '/',
        template: path.join(__dirname, '..', 'reactjs', 'public', 'index.html'),
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(
              __dirname,
              '..',
              'reactjs',
              'public',
              'favicon.ico'
            ),
            to: 'static/assets/ico/[name][ext]',
          },
        ],
      }),
      new ESLintPlugin({
        extensions: ['ts', 'tsx'],
      }),
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
          use: [
            env.prod ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader',
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.(woff(2)?|ttf|eot)$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/assets/fonts/[name][ext]',
          },
        },
        {
          test: /\.svg$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/assets/svg/[name][ext]',
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
    devServer: {
      open: true,
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 4000,
      proxy: {
        '/api': env.proxy,
      },
    },
    stats: 'errors-warnings',
  };
};
