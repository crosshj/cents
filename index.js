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
app.use(bodyParser.urlencoded({
  extended: false
}));

require('./service/authentication').init(app);

var settings = {
  cookieSecret: 'foofosioaoiodsllkl3klkl523l',
  folderLocation:  path.join(__dirname, '/service/database/data')
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

app.post('/login', passport.authenticate('local', {
  successRedirect: './',
  failureRedirect: './welcome'
}));

app.get('/welcome', (req, res) => {
  res.header('Content-Type', 'text/html').send(`
    <h3>Log in :</h3>

    <form action="./login" method="post">
      <p>TODO: make this look nice</p>
      <input name="username" id="username" type="text" placeholder="Your username" />
      <input name="password" id="password" type="password" placeholder="Your password"/>
      <input type="submit" />
    </form>
  `);
});

app.get('/profile', passport.authenticationMiddleware(), function(req, res) {
  res.send('okay!');
});

var responsivePath = path.join(__dirname, '/html/Skeleton-2.0.4');
app.use('/', passport.authenticationMiddleware(), express.static(responsivePath));

var swipePath = path.join(__dirname, '/html/skeleton-swipe');
app.use('/swipe', express.static(swipePath));

app.post('/accounts', passport.authenticationMiddleware(), postAccounts);

require('./service/routes')(app, passport);

app.listen(appPort, function () {
  console.log('New server on port ' + appPort + '!');
  console.log('Old server on port 8080!');
});
