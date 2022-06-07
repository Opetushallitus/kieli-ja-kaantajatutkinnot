const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { GitRevisionPlugin } = require("git-revision-webpack-plugin");

module.exports = (appName, env, dirName) => {
  const STATIC_PATH = `${appName}/static`;
  const mode = env.prod ? "production" : "development";
  const gitRevisionPlugin = new GitRevisionPlugin({
    branch: true,
  });

  return {
    getMode: () => ({ mode }),
    getEntry: () => ({ entry: path.join(dirName, "src", "index.tsx") }),
    getOutput: () => ({
      output: {
        filename: `${STATIC_PATH}/js/bundle.js`,
        path: path.join(
          dirName,
          "..",
          "..",
          "..",
          "backend",
          appName,
          "src",
          "main",
          "resources",
          "static"
        ),
      },
    }),

    getPlugins: () => ({
      plugins: [
        new CompressionPlugin({
          algorithm: "gzip",
        }),
        new MiniCssExtractPlugin({
          filename: `${STATIC_PATH}/css/[name].css`,
        }),
        new CopyPlugin({
          patterns: [
            {
              from: path.join(dirName, "public", "favicon.ico"),
              to: `${STATIC_PATH}/assets/ico/[name][ext]`,
            },
          ],
        }),
        gitRevisionPlugin,
        new webpack.DefinePlugin({
          REACT_ENV_PRODUCTION: JSON.stringify(Boolean(env.prod)),
        }),
        new HtmlWebpackPlugin({
          publicPath: env.prod ? `/${appName}/` : "/",
          template: path.join(dirName, "public", "index.html"),
          templateParameters: {
            GIT_INFO: `${gitRevisionPlugin.branch()}-${gitRevisionPlugin.commithash()}`,
          },
        }),
        ...getESLintPlugin(env),
        ...getStylelintPlugin(env),
      ],
    }),

    getModules: () => ({
      module: {
        rules: [
          {
            test: /\.[tj]sx?$/,
            loader: "babel-loader",
            exclude: /node_modules\/(?!(shared)\/).*/,
          },
          {
            test: /\.s?css$/,
            use: [
              env.prod ? MiniCssExtractPlugin.loader : "style-loader",
              "css-loader",
              "sass-loader",
            ],
            exclude: /node_modules\/(?!(shared)\/).*/,
          },
          {
            test: /\.(woff(2)?|ttf|eot)$/,
            type: "asset/resource",
            generator: {
              filename: `${STATIC_PATH}/assets/fonts/[name][ext]`,
            },
          },
          {
            test: /\.svg$/,
            type: "asset/resource",
            generator: {
              filename: `${STATIC_PATH}/assets/svg/[name][ext]`,
            },
          },
        ],
      },
    }),

    getResolve: () => ({
      resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        modules: [
          path.resolve(dirName, "src"),
          path.resolve(dirName, "..", "shared", "src"),
          "node_modules",
        ],
        alias: {
          public: path.resolve(dirName, "public/"),
        },
      },
    }),

    getDevTool: () => ({
      devtool: env.prod ? "source-map" : "cheap-module-source-map",
    }),

    getStats: () => ({ stats: "errors-warnings" }),

    getDevServer: () => ({
      devServer: {
        open: `/${appName}/etusivu`,
        historyApiFallback: true,
        static: {
          directory: path.join(dirName, "public"),
        },
        compress: true,
        port: 4000,
        proxy: {
          [`/${appName}/api`]: env.proxy,
        },
      },
    }),
  };
};

// Helpers
const getStylelintPlugin = (env) => {
  if (!env.cypress) {
    const StylelintPlugin = require("stylelint-webpack-plugin");
    return [new StylelintPlugin()];
  }
  return [];
};

const getESLintPlugin = (env) => {
  if (!env.prod && !env.cypress) {
    const ESLintPlugin = require("eslint-webpack-plugin");
    return [
      new ESLintPlugin({
        extensions: ["ts", "tsx"],
      }),
    ];
  }
  return [];
};
