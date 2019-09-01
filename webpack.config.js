var webpack = require('webpack');
var path = require('path');
const sass = require('sass');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const swManifest = require('./client/manifest.json');

var fs = require('fs');
require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
const offlineHTML = require('./client/offline.html');

//var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, './dist/client/');
//console.log({ BUILD_DIR})
var APP_DIR = path.resolve(__dirname, 'client/');

//var BUILD_DIR = '/client/build';
//var APP_DIR = './client/js/react';

process.traceDeprecation = true;

const extractSass = new MiniCssExtractPlugin({
	filename: '[name].css',
	ignoreOrder: false, // Enable to remove warnings about conflicting order
});

const injectSW = (content, path) => (
	content.toString()
		.replace('__SW_VERSION__', `${(new Date()).toLocaleDateString()} ${(new Date()).toLocaleTimeString()}`)
		.replace('__MANIFEST__', JSON.stringify(swManifest, null, '\t'))
		.replace('__OFFLINE_HTML__', offlineHTML)
);

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
		filename: "[name].js",
		chunkFilename: '[name].js',
	},
	mode: 'none',
	optimization: {
		minimize: true,
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /(node_modules|vendor)/,
					chunks: 'initial',
					name: 'vendor',
					enforce: true
				}
			}
		},
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			jquery: 'jquery/dist/jquery.slim.min.js',
			//moment: 'moment/min/moment.min.js',
			moment: 'dayjs',
			//'react': 'react-dom/cjs/react-dom.production.min.js',
			//'react-dom': 'react/cjs/react.production.min.js',
			// "react": "preact-compat",
			// "react-dom": "preact-compat"
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
		new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
		extractSass,
		// new HtmlWebpackPlugin({
		//   title: 'HA Bridge Configuration',
		//   template: 'index.ejs',
		//   inject: false
		// }),

		new CopyWebpackPlugin([
			{ from: 'client/images', to: 'images/' },
			{ from: 'client/*.json', to: '../' },
			{ from: 'client/*.htm*', to: '../' },
			{ from: 'client/fonts', to: 'fonts/' },
			{ from: 'client/serviceWorker', to: './', transform: injectSW },

		])
	],
	module: {
		rules: [
			{
				test: /\.jsx?/,
				loader: 'babel-loader?cacheDirectory=true',
				exclude: /(node_modules|bower_components)/,
				options: {
					presets: ['babel-preset-env', 'babel-preset-react'],
					plugins: []
				}
			},
			{
				test: /\.(css|sass|scss)$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: { url: false }
					},
					{
						loader: 'sass-loader',
						options: {
							implementation: sass
						}
					}
				],
			},
			{
				test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							outputPath: 'fonts',
						}
					},
				],
			}
		]
	}
};

if (process.env.NODE_ENV === 'dev') {
	const liveReloadPlugin = require('webpack-livereload-plugin');
	config.plugins.push(new liveReloadPlugin({
		//live-reload options
	}));
}

module.exports = config;
