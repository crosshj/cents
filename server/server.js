/*
eslint-disable no-console
*/
var session = require('express-session');
var serveStatic = require('serve-static');
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');

function serverStart(app, settings) {
  var useFileStore = true;
  var store = ((sess) => {
    if(useFileStore){
      const FileStore = require('session-file-store')(session);
      const fileStoreOptions = {
        path: settings.folderLocation
      };
      const store = new FileStore(fileStoreOptions);
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

  app.use(compression());
  app.enable('etag', 'strong');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(serveStatic('./dist/client', {
    index: ['index.html', 'index.htm']
  }));
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
  const hostname = 'http://localhost';

  app.listen(settings.appPort, function () {
    console.log(`\nDone. Server ready at ${hostname}:${settings.appPort} .`);
  });
}

module.exports = serverStart;
