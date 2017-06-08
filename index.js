/*
eslint-disable no-console
*/

const path = (path) => require('path').join(__dirname, path);

var express = require('express');
var session = require('express-session');
var TingoStore = require('connect-tingo')({session});
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');

var appPort = 8080;

var cron = require('./service/cron');
cron();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./server/authentication').init(app);
var settings = {
  cookieSecret: require('crypto').randomBytes(64).toString('hex'),
  folderLocation:  path('/service/database/data')
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
const PROTECTED = passport.authenticationMiddleware;

app.post('/login', passport.authenticate('local', {
  successReturnToOrRedirect: './',
  failureRedirect: './login'
}));

app.use('/json', PROTECTED(), require('./server/getJSON'));
app.post('/accounts', PROTECTED(), require('./server/postAccounts'));

require('./server/routes')(app, passport);
app.use('/', express.static(path('/client')));

app.listen(appPort, function () {
  console.log('New server on port ' + appPort + '!');
});
