const path = require('path');
const webpack = require('webpack');
const settings = require('availity-workflow-settings');
const exists = require('exists-sync');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ruleFonts = require('availity-workflow-settings/webpack/rule-fonts');
const loaderPostcss = require('availity-workflow-settings/webpack/loader-postcss');

process.noDeprecation = true;

const VersionPlugin = require('./version');

const babelrcPath = path.join(settings.project(), '.babelrc');
const babelrcExists = exists(babelrcPath);

function getVersion() {
  return settings.pkg().version || 'N/A';
}

const config = {

  context: settings.app(),

  entry: {
    'index': [
      './index.js'
    ]
  },

  output: {
    path: settings.output(),
    filename: settings.fileName()
  },

  devtool: 'cheap-module-source-map',

  resolve: {
    // Tell webpack what directories should be searched when resolving modules
    modules: [
      settings.app(),
      path.join(settings.project(), 'node_modules'),
      path.join(__dirname, 'node_modules')
    ],
    symlinks: true,
    extensions: ['.js', '.jsx', '.json', '.css', 'scss']
  },

  // This set of options is identical to the resolve property set above,
  // but is used only to resolve webpack's loader packages.
  resolveLoader: {
    modules: [
      path.join(settings.project(), 'node_modules'),
      path.join(__dirname, 'node_modules')
    ],
    symlinks: true
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: settings.app(),
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                require.resolve('availity-workflow-babel-preset')
              ],
              cacheDirectory: settings.isDevelopment(),
              babelrc: babelrcExists
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: { sourceMap: true }
            },
            loaderPostcss
          ],
          publicPath: '../'
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: { sourceMap: true }
            },
            loaderPostcss,
            'sass-loader?sourceMap'
          ],
          publicPath: '../'
        })
      },
      ruleFonts,
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'url-loader?name=images/[name].[ext]&limit=10000'
        ]
      }
    ]
  },
  plugins: [

    new webpack.DefinePlugin(settings.globals('')),

    new VersionPlugin({
      version: JSON.stringify(getVersion())
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'profile.html'
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks(module) {
        // this assumes your vendor imports exist in the node_modules directory
        return module.context && module.context.indexOf('node_modules') !== -1;
      }
    }),

    new ExtractTextPlugin(`css/${settings.css()}`),

    new DuplicatePackageCheckerPlugin(),

    // Ignore all the moment local files
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new CaseSensitivePathsPlugin()

  ]
};

module.exports = config;

