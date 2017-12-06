var webpack = require('webpack');
//var path = require('path');

//var HtmlWebpackPlugin = require('html-webpack-plugin');
//var CopyWebpackPlugin = require('copy-webpack-plugin');

// var BUILD_DIR = path.resolve(__dirname, 'js/react/build');
// var APP_DIR = path.resolve(__dirname, 'js/react');

var BUILD_DIR = '/client/build';
var APP_DIR = './client/js/react';

var config = {
  entry: {
    app: APP_DIR + '/app'
  },
  output: {
    path: BUILD_DIR,
    filename: "[name].js"
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
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
        unsafe: true,
        unsafe_comps: true,
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
        loader : 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        options: {
          presets: ['babel-preset-env', 'babel-preset-react']
        }
      }
    ]
  }
};

module.exports = config;
