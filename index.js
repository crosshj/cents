/*
eslint-disable no-console
*/

var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

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

app.listen(appPort, function () {
  console.log('Example app listening on port ' + appPort + '!');
});
