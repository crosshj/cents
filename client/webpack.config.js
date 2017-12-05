//var webpack = require('webpack');
//var path = require('path');

//var HtmlWebpackPlugin = require('html-webpack-plugin');
//var CopyWebpackPlugin = require('copy-webpack-plugin');

// var BUILD_DIR = path.resolve(__dirname, 'js/react/build');
// var APP_DIR = path.resolve(__dirname, 'js/react');

var BUILD_DIR = '/client/build';
var APP_DIR = './client/js/react';

var config = {
  entry: {
    app: APP_DIR + '/app.js'
  },
  output: {
    path: BUILD_DIR,
    filename: "[name].js"
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
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
        options: {
          presets: ['babel-preset-env', 'babel-preset-react']
        }
      }
    ]
  }
};

module.exports = config;
