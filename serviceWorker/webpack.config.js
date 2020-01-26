var webpack = require('webpack');
var path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

var BUILD_DIR = path.resolve(__dirname, './build');
var APP_DIR = path.resolve(__dirname, './app');

const extractSass = new ExtractTextPlugin({
   filename: "bundle.css",
   disable: false
});

let commitHash = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString()
  .replace(/\n/g, '');

let commitDate = require('child_process')
  .execSync('git log -1 --format=%ct')
  .toString()
  .replace(/\n/g, '') + '000'; //because timestamp is in seconds, not milliseonds

let commitURI = `https://github.com/crosshj/cents/commit/${commitHash}`;

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
      jquery: 'jquery/dist/jquery.slim.min.js',
      moment: 'moment/min/moment.min.js'
      //'react': 'react-dom/cjs/react-dom.production.min.js',
      //'react-dom': 'react/cjs/react.production.min.js'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': '"production"',
        'COMMIT_URI': `"${commitURI}"`,
        'COMMIT_HASH': `"${commitHash}"`,
        'COMMIT_DATE': commitDate
      }
    }),
    // eslint-disable-next-line no-useless-escape
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
    }),
    extractSass

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
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
            use: [{
                loader: "css-loader"
            }, {
                loader: "sass-loader"
            }],
            // use style-loader in development
            fallback: "style-loader"
        })
      },
      {
        test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader : 'file-loader'
      }
    ]
  }
};

module.exports = config;
