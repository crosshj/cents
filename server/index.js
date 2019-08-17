/*
eslint-disable no-console
*/
var path = require('path');
var express = require('express');
var session = require('express-session');
var serveStatic = require('serve-static');
//var TingoStore = require('connect-tingo')({session});

var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
  uri: 'mongodb://ubuntu:27017',
  databaseName: 'cents',
  collection: 'sessions'
},
function(error) {
  if(error) console.log({ mongoConnectError: error});
  // Should have gotten an error
});
store.on('error', function(error) {
  console.log(error);
});


var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');

var appPort = process.env.PORT || 8080;

//var cron = require('../service/cron');
//cron();

var app = express();
app.enable('etag', 'strong');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use('/', express.static(
//   path.resolve(__dirname, '../client'),
//   {
//         setHeaders: (res) => {
//             res.setHeader('x-powered-by', 'Foo')
//         },
//         redirect: false
//     }
// ));

app.use(serveStatic(
  require('path').resolve(__dirname, '../dist/client'),
  { 
    index: ['index.html', 'index.htm']
  }
));



require('./authentication').init(app);
var settings = {
  cookieSecret: require('crypto').randomBytes(64).toString('hex'),
  folderLocation:  path.resolve(__dirname, '../service/database/data')
};

app.use(cookieParser());
// console.log({
//   settings 
// });
app.use(session({
    secret: settings.cookieSecret,
    // store: new TingoStore({
    //   db: settings.folderLocation
    // }),
    store,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

require('./routes')(app, passport);

const useWebpackDevMiddleware = process.env.NODE_ENV === 'dev';
if (useWebpackDevMiddleware){
  console.log('Using Webpack Dev Middleware!');
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
