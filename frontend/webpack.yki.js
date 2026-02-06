const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const Dotenv = require('dotenv-webpack')


// cloud-base path for new yki clerk is '/yki/v2' 
module.exports = (appName, env, dirName, port, entryPage = "etusivu", isClerk = false
) => {
  const CONTEXT_PATH = appName;

  const getMode = () => ({ mode: env.prod ? "production" : "development" });
  const getEntry = () => ({ entry: path.join(dirName, "src", "index.tsx") });
  const getOutput = () => ({
    output: {
      filename: `js/[name].[contenthash].js`,
      path: path.join(
        dirName,
        "..",
        "..",
        "..",
        "..",
        "backend",
        appName,
        "src",
        "main",
        "resources",
        "static",
        isClerk ? "v2/clerk" : "public",
      )
    },
  });

  const getPlugins = () => ({
    plugins: [
      new CompressionPlugin({
        algorithm: "gzip",
      }),
      new MiniCssExtractPlugin({
        filename: `css/[name].[contenthash].css`,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(dirName, "public", "favicon.ico"),
            to: `assets/ico/[name][ext]`,
          },
        ],
      }),
      new webpack.DefinePlugin({
        REACT_ENV_PRODUCTION: JSON.stringify(Boolean(env.prod)),
      }),
      ...getESLintPlugin(env),
      ...getStylelintPlugin(env),
      ...getHtmlWebpackPlugin(env, CONTEXT_PATH, dirName, isClerk),
      new CSPNoncePlaceholderInjectorPlugin(),
      new Dotenv()
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
            filename: `assets/fonts/[name][ext]`,
          },
        },
        {
          test: /\.svg$/,
          type: "asset/resource",
          generator: {
            filename: `assets/svg/[name][ext]`,
          },
        },
        {
          test: /\.(avif|jpg|webp)$/,
          type: "asset/resource",
          generator: {
            filename: `assets/images/[name][ext]`
          }
        },
        {
          test: /\.m?js$/,
          resolve: {
              fullySpecified: false,
          },
        }
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
      proxy: env.proxy && [{
        "context": [`/${CONTEXT_PATH}/v2/api`],
        "target": env.proxy,
        "secure": false,
      },
      {
        "context": [`/${CONTEXT_PATH}/auth`],
        "target": env.proxy,
        "secure": false,
      },
      {
        "context": [`/${CONTEXT_PATH}/api`],
        "target": env.proxy,
        "secure": false,
      }],
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

const getHtmlWebpackPlugin = (env, appName, dirName, isClerk) => {
  const publicPath = env.prod && !env.cypress 
    ? (isClerk ? `/${appName}/v2/clerk` : `/${appName}/public/`)
    : "/";
  
  const configs = {
    publicPath,
    template: path.join(dirName, "public", "index.html"),
    templateParameters: {
      GIT_INFO: "Not available",
    },
  };

  if (!env.cypress && isGitAvailable()) {
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
