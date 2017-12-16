var webpack = require('webpack');
var path = require('path');

//var HtmlWebpackPlugin = require('html-webpack-plugin');
//var CopyWebpackPlugin = require('copy-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, 'client/js/build');
var APP_DIR = path.resolve(__dirname, 'client/js/react');

//var BUILD_DIR = '/client/build';
//var APP_DIR = './client/js/react';

var config = {
  entry: {
    app: APP_DIR + '/app'
  },
  output: {
    path: BUILD_DIR,
    filename: "[name].js"
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      // moment: 'moment/src/moment'
      //'react': 'react-dom/cjs/react-dom.production.min.js',
      //'react-dom': 'react/cjs/react.production.min.js'
    }
  },
  plugins: [
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     'NODE_ENV': '"production"'
    //   }
    // }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        // this assumes your vendor imports exist in the node_modules directory
        return module.context && module.context.includes("node_modules");
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false, // Suppress uglification warnings
        pure_getters: true,
        unsafe: false,
        unsafe_comps: false,
        screw_ie8: true
      },
      output: {
        comments: false,
      },
      exclude: [/\.min\.js$/gi], // skip pre-minified libs
      test: /(vendor\.js)+/i
    })

    // new HtmlWebpackPlugin({
    //   title: 'HA Bridge Configuration',
    //   template: 'index.ejs',
    //   inject: false
    // }),

    // new CopyWebpackPlugin([
    //   { from: 'icons', to: 'icons' },
    //   { from: 'css', to: 'css' },
    //   { from: 'manifest.json', to: 'manifest.json'},
    //   { from: 'offline.html', to: 'offline.html'}
    // ])
  ],
  module : {
    rules : [
      {
        test : /\.jsx?/,
        loader : 'babel-loader?cacheDirectory=true',
        exclude: /(node_modules|bower_components)/,
        options: {
          presets: ['babel-preset-env', 'babel-preset-react'],
          plugins: []
        }
      }
    ]
  }
};

module.exports = config;
