/*
eslint-disable no-console
*/
var path = require('path');
var express = require('express');
var session = require('express-session');
var serveStatic = require('serve-static');
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var appPort = process.env.PORT || 8080;
var app = express();

var settings = {
  cookieSecret: process.env.COOKIE_SECRET || require('crypto').randomBytes(64).toString('hex'),
  folderLocation:  path.resolve(__dirname, '../service/database/data')
};
// console.log({
//   settings
// });

var useFileStore = true;
var store = ((sess) => {
	if(useFileStore){
		const FileStore = require('session-file-store')(session);
		const fileStoreOptions = {
			path: settings.folderLocation
		};
		const store = new FileStore(fileStoreOptions)
		return store;
	}

	var MongoDBStore = require('connect-mongodb-session')(sess);
	const connectErrorCallback = (error) => {
		if(error) {
			console.log({ mongoConnectError: error});
		}
	};
	var store = new MongoDBStore({
		uri: 'mongodb://ubuntu:27017',
		databaseName: 'cents',
		collection: 'sessions'
	}, connectErrorCallback);

	store.on('error', connectErrorCallback);
	return store;

})(session);


//var cron = require('../service/cron');
//cron();
app.use(compression());
app.enable('etag', 'strong');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(serveStatic(
  require('path').resolve(__dirname, '../dist/client'),
  {
    index: ['index.html', 'index.htm']
  }
));

require('./authentication').init(app);

app.use(cookieParser());
app.use(session({
    secret: settings.cookieSecret,
    store,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

require('./routes')(app, passport);

const useWebpackDevMiddleware = process.env.NODE_ENV === 'dev';
if (useWebpackDevMiddleware){
  console.log('Using Webpack Dev Middleware (NOT)!');
  const webpack = require('webpack');
  //const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackConfig = require('../webpack.config.js');

  const webpackCompilerCallback = (err, output) => {
    if(err){
      console.log('--- webpack compile error ---');
      console.log(JSON.stringify(err));
      return;
    }

    console.log('Webpack finished client build.');
    //console.log({ output });
    //console.log(Object.keys(output));
    //console.log(JSON.stringify(output.toJson()));
    // webpackCompiler.watch({}, (err, stats) => {
    //   if(err) {
    //     console.log({ err });
    //   }
    //   console.log('Webpack finished build.');
    //   //console.log({ stats });
    // });
  };
  //console.log(Object.keys(webpack));
  webpackConfig.watch = true;
  const webpackCompiler = webpack(webpackConfig, webpackCompilerCallback);

  // const webpackCompiler = webpack(webpackConfig, function(err, stats) {
  //   if (err) { return console.log(err); }
  //   console.log();
  //   console.log(stats.toString({
  //     chunks: false,
  //     modules: false,
  //     chunkOrigins: false,
  //     colors: true
  //   }));
  //   console.log(`\nDone. Server ready on port ${appPort}.`);
  //   return;
  // });

  //const publicPath = require('path').resolve(__dirname, '../dist/client');
  //console.log({ publicPath })
  // app.use(webpackDevMiddleware(webpackCompiler, {
  //   publicPath,
  //   writeToDisk: true,
  //   quiet: false,
  //   lazy: true,
  //   watchOptions: {
  //     poll: true
  //   },
  //   stats: {
  //     colors: true
  //   }
  // }));

}

const hostname = 'http://localhost';

app.listen(appPort, function(){
  console.log(`\nDone. Server ready at ${hostname}:${appPort} .`);
});
