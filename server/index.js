/*
eslint-disable no-console
*/
var path = require('path');
var express = require('express');
var session = require('express-session');
var TingoStore = require('connect-tingo')({session});
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../webpack.config.js');
const webpackCompiler = webpack(webpackConfig);

// const webpackCompiler = webpack(webpackConfig, function(err, stats) {
//   if (err) { console.log(err); }
//   console.log(stats.toJson('verbose'));
// });

var appPort = 8080;

var cron = require('../service/cron');
cron();

var app = express();
app.enable('etag', 'strong');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./authentication').init(app);
var settings = {
  cookieSecret: require('crypto').randomBytes(64).toString('hex'),
  folderLocation:  path.resolve(__dirname, '../service/database/data')
};
app.use(cookieParser());
app.use(session({
    secret: settings.cookieSecret,
    store: new TingoStore({
      db: settings.folderLocation
    }),
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

require('./routes')(app, passport);

app.use(webpackDevMiddleware(webpackCompiler, {
  publicPath: '/js/react/build/',
  stats: {
		colors: true
	}
}));

app.use('/', express.static(
  path.resolve(__dirname, '../client'),
  {
        setHeaders: (res) => {
            res.setHeader('x-powered-by', 'Foo')
        },
        redirect: false
    }
));

app.listen(appPort, function () {
  console.log(`Server on port ${appPort}.  Wait for client build webpack...`);
});
