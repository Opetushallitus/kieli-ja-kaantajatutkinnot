const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = (appName, env, dirName, port, entryPage = "etusivu") => {
  const STATIC_PATH = `${appName}/static`;
  const CONTEXT_PATH = appName;

  const getMode = () => ({ mode: env.prod ? "production" : "development" });
  const getEntry = () => ({ entry: path.join(dirName, "src", "index.tsx") });
  const getOutput = () => ({
    output: {
      filename: `${STATIC_PATH}/js/[name].[contenthash].js`,
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
  });

  const getPlugins = () => ({
    plugins: [
      new CompressionPlugin({
        algorithm: "gzip",
      }),
      new MiniCssExtractPlugin({
        filename: `${STATIC_PATH}/css/[name].[contenthash].css`,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(dirName, "public", "favicon.ico"),
            to: `${STATIC_PATH}/assets/ico/[name][ext]`,
          },
        ],
      }),
      new webpack.DefinePlugin({
        REACT_ENV_PRODUCTION: JSON.stringify(Boolean(env.prod)),
      }),
      ...getESLintPlugin(env),
      ...getStylelintPlugin(env),
      ...getHtmlWebpackPlugin(env, CONTEXT_PATH, dirName),
      new CSPNoncePlaceholderInjectorPlugin(),
    ],
  });

  const getModules = () => ({
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
  });

  const getResolve = () => ({
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
  });

  const getDevTool = () => ({
    devtool: env.prod ? "source-map" : "cheap-module-source-map",
  });

  const getStats = () => ({ stats: "errors-warnings" });

  const getDevServer = () => ({
    devServer: {
      open: `/${CONTEXT_PATH}/${entryPage}`,
      historyApiFallback: true,
      static: {
        directory: path.join(dirName, "public"),
      },
      compress: true,
      port,
      proxy: {
        [`/${CONTEXT_PATH}/api`]: env.proxy,
        [`/${CONTEXT_PATH}/auth`]: env.proxy,
      },
    },
  });

  const getDefaults = () => ({
    ...getMode(),
    ...getEntry(),
    ...getOutput(),
    ...getPlugins(),
    ...getModules(),
    ...getResolve(),
    ...getDevTool(),
    ...getStats(),
    ...getDevServer(),
  });

  return {
    getMode,
    getEntry,
    getOutput,
    getPlugins,
    getModules,
    getResolve,
    getDevTool,
    getStats,
    getDevServer,
    getDefaults,
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

const getHtmlWebpackPlugin = (env, appName, dirName) => {
  const configs = {
    publicPath: env.prod && !env.cypress ? `/${appName}/` : "/",
    template: path.join(dirName, "public", "index.html"),
    templateParameters: {
      GIT_INFO: "Not available",
    },
  };

  if ((!env.docker || !env.cypress) && isGitAvailable()) {
    const { GitRevisionPlugin } = require("git-revision-webpack-plugin");
    const gitRevisionPlugin = new GitRevisionPlugin({
      branch: true,
    });
    return [
      gitRevisionPlugin,
      new HtmlWebpackPlugin({
        ...configs,
        templateParameters: {
          GIT_INFO: `${gitRevisionPlugin.branch()}-${gitRevisionPlugin.commithash()}`,
        },
      }),
    ];
  }

  return [new HtmlWebpackPlugin(configs)];
};

const isGitAvailable = () => {
  return fs.existsSync(path.join(__dirname, "..", ".git"));
};

const addThymeleafNoncePlaceholder = (e) => {
  e.attributes["th:attr"] = "nonce=${cspNonce}";
};

class CSPNoncePlaceholderInjectorPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "CSPNoncePlaceholderInjectorPlugin",
      (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
          "CSPNoncePlaceholderInjectorPlugin",
          (data, cb) => {
            const { scripts, styles, meta } = data.assetTags;
            scripts.forEach(addThymeleafNoncePlaceholder);
            styles.forEach(addThymeleafNoncePlaceholder);
            meta.push(
              HtmlWebpackPlugin.createHtmlTagObject("meta", {
                name: "csp-nonce",
                "th:attr": "content=${cspNonce}",
              })
            );

            cb(null, data);
          }
        );
      }
    );
  }
}
