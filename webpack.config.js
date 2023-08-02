// @ts-check
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');

const Production = 0;
const Docker = 1;
const Development = 2;

const source = path.resolve(__dirname, 'src');

module.exports = function (/** @type {object} */ env) {
  // FIXME: Enable source map for sass. The problem right now is it will not work if "devtool" is "eval".
  // But if we use the other values the source map for SFC will not work.
  const config = {
    mode: getEnvId(env) === Development ? 'development' : 'production',
    entry: path.resolve(source, 'index.ts'),
    output: {
      filename: path.join('js', '[contenthash].js'),
      chunkFilename: path.join('js', '[contenthash].js'),
      publicPath: '/'
    },
    resolve: {
      alias: {
        '@': source,
        vue$: 'vue/dist/vue.runtime.esm.js'
      },
      extensions: ['.wasm', '.mjs', '.ts', '.js', '.json']
    },
    module: {
      rules: [
        {
          test: /\.(svg|jpg|png)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'img/[hash][ext][query]'
          }
        },
        {
          test: /\.ttf$/i,
          type: 'asset/resource',
          generator: {
            filename: 'ttf/[hash][ext][query]'
          }
        },
        {
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                esModule: true
              }
            },
            {
              loader: 'css-loader'
            }
          ]
        },
        {
          test: /\.scss$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                esModule: true
              }
            },
            {
              loader: 'css-loader'
            },
            {
              loader: 'resolve-url-loader'
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true
              }
            }
          ]
        },
        {
          test: /\.js$/i,
          resolve: {
            fullySpecified: false
          }
        },
        {
          test: /\.ts$/i,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(__dirname, 'tsconfig.json'),
                onlyCompileBundledFiles: true,
                appendTsSuffixTo: [/\.vue$/i]
              }
            }
          ]
        },
        {
          test: /\.vue$/i,
          loader: 'vue-loader'
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(source, 'index.html')
      }),
      new FaviconsWebpackPlugin({
        logo: path.resolve(source, 'favicon.svg'),
        prefix: '',
        favicons: {
          icons: {
            android: false,
            appleIcon: false,
            appleStartup: false,
            favicons: true,
            windows: false,
            yandex: false
          }
        }
      }),
      new MiniCssExtractPlugin({
        filename: path.join('css', '[contenthash].css'),
        chunkFilename: path.join('css', '[contenthash].css')
      }),
      new webpack.DefinePlugin({
        'process.env.BASE_URI': JSON.stringify(getBaseUri()),
        'process.env.SERVER_URI': JSON.stringify(getServerUri()),
        'process.env.OIDC_PROVIDER': JSON.stringify(getOidcProvider()),
        'process.env.OIDC_REDIRECT_URI': JSON.stringify(getOidcRedirectUri()),
        'process.env.OIDC_SIGNEDOUT_URI': JSON.stringify(getOidcSignedOutUri()),
        'process.env.STRIPE_KEY': JSON.stringify(getStripeKey()),
        'process.env.CAPTCHA_KEY': JSON.stringify(getCaptchaKey())
      }),
      new VueLoaderPlugin(),
      new MonacoWebpackPlugin({
        filename: path.join('js', '[contenthash].js'),
        languages: []
      })
    ],
    optimization: {
      minimize: getEnvId(env) !== Development,
      minimizer: getEnvId(env) !== Development ? [new TerserPlugin(), new CssMinimizerPlugin()] : [],
      runtimeChunk: 'single'
    },
    devtool: getEnvId(env) !== Development ? false : 'eval-source-map',
    devServer: {
      server: {
        type: 'https',
        options: {
          cert: path.resolve(__dirname, 'certificate.pem'),
          key: path.resolve(__dirname, 'certificate.key')
        }
      },
      client: {
        overlay: {
          warnings: false
        }
      },
      host: '0.0.0.0',
      allowedHosts: 'all',
      historyApiFallback: true,
      hot: false
    }
  };

  return config;
};

function getBaseUri() {
  return process.env.CSM_BASE_URI || 'https://localhost:8080';
}

function getServerUri() {
  return process.env.CSM_SERVER_URI || 'https://localhost:5001';
}

function getOidcProvider() {
  return process.env.CSM_OIDC_PROVIDER || 'https://localhost:5000';
}

function getOidcRedirectUri() {
  return `${getBaseUri()}/signed-in`;
}

function getOidcSignedOutUri() {
  return getBaseUri();
}

function getStripeKey() {
  return process.env.CSM_STRIPE_KEY;
}

function getCaptchaKey() {
  return process.env.CSM_CAPTCHA_KEY;
}

/**
 * @param {object} env
 */
function getEnvId(env) {
  if (env.production) {
    return Production;
  } else if (env.docker) {
    return Docker;
  } else if (env.development) {
    return Development;
  } else {
    throw new Error(`Unknown environment ${env}.`);
  }
}
