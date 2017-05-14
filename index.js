/*
eslint-disable no-console
*/

var path = require('path');
var express = require('express');
var session = require('express-session');
var TingoStore = require('connect-tingo')({session});
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();
var appPort = 81;

var cron = require('./service/cron');
cron();

var postAccounts = require('./lib/postAccounts');

// listens on 8080
var oldServer = require('./oldCode/cents.node.server.js');
var useOldserver = true;
useOldserver && oldServer();

var jsonParser = bodyParser.json(); // eslint-disable-line no-unused-vars

var responsivePath = path.join(__dirname, '/html/Skeleton-2.0.4');
app.use('/', express.static(responsivePath));

var swipePath = path.join(__dirname, '/html/skeleton-swipe');
app.use('/swipe', express.static(swipePath));

app.post('', postAccounts);

require('./service/routes')(app);

var settings = {
  cookieSecret: 'foofosioaoiodsllkl3klkl523l',
  folderLocation: '/service/database/data'
};
app.use(express.cookieParser());
app.use(session({
    secret: settings.cookie_secret,
    store: new TingoStore({
      db: settings.folderLocation
    }),
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

var user = {
  username: 'user',
  password: 'password',
  id: 1
};

function authenticationMiddleware () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };
}

function findUser(username, callback){
  callback(null, user);
}

passport.use(new LocalStrategy(
  function(username, password, done) {
    findUser(username, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (password !== user.password  ) {
        return done(null, false);
      }
      return done(null, user);
    });
  }
));

app.get('/profile', authenticationMiddleware(), function(req, res) {
  res.send('okay!');
});

app.listen(appPort, function () {
  console.log('Example app listening on port ' + appPort + '!');
});
