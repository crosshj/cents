/* istanbul ignore file */
/* eslint-disable no-console */


var serveStatic = require('serve-static');
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const errorHandler = require('./expressErrorHandler');
const hostname = 'http://localhost';

const AppSession = require('./session');

function serverStart(app, settings) {

  app.use(compression());
  app.enable('etag', 'strong');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(serveStatic('./dist/client', {
    index: ['index.html', 'index.htm']
  }));

  const thisSession = new AppSession(app, 'redis', settings);

  app.use(cookieParser());

  require('./routes')(app, thisSession.protect);

  app.use(errorHandler);

  app.listen(settings.appPort, function () {
    console.log(`\nDone. Server ready at ${hostname}:${settings.appPort} .`);
  });
}

module.exports = serverStart;
