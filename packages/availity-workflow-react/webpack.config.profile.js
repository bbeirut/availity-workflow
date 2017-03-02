const path = require('path');
const webpack = require('webpack');
const settings = require('availity-workflow-settings');
const exists = require('exists-sync');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

const VersionPlugin = require('./version');
const postCssLoader = require('./postcss');

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
    ],
    'vendor': [
      './vendor.js'
    ]
  },

  output: {
    path: settings.output(),
    filename: settings.fileName()
  },

  devtool: settings.sourceMap(),

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
        use: [
          'style-loader',
          'css-loader',
          postCssLoader
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          postCssLoader,
          'sass-loader'
        ]
      },
      {
        // test should match the following:
        //
        //  '../fonts/availity-font.eot?18704236'
        //  '../fonts/availity-font.eot'
        //
        test: /\.(otf|ttf|woff2?|eot|svg)(\?.*)?$/,
        use: [
          'file-loader?name=fonts/[name].[ext]'
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'url-loader?name=images/[name].[ext]&limit=10000'
        ]
      }
    ]
  },
  plugins: [

    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    }),

    new VersionPlugin({
      version: JSON.stringify(getVersion())
    }),

    new DuplicatePackageCheckerPlugin(),

    // Ignore all the moment local files
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),

    new CaseSensitivePathsPlugin()

  ]
};

module.exports = config;
