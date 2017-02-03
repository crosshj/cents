var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var appPort = 81;

var postAccounts = require('./lib/postAccounts');

// listens on 8080
var oldServer = require('./oldCode/cents.node.server.js');
var useOldserver = true;
useOldserver && oldServer();

var jsonParser = bodyParser.json();

app.get('/', function (req, res) {
  res.send('Hello World!')
})

var responsivePath = path.join(__dirname, '/html/Skeleton-2.0.4');
//console.log(responsivePath);
app.use('/responsive', express.static(responsivePath));

var swipePath = path.join(__dirname, '/html/skeleton-swipe');
//console.log(responsivePath);
app.use('/swipe', express.static(swipePath));

app.post('', postAccounts);


app.listen(appPort, function () {
  console.log('Example app listening on port ' + appPort + '!')
})
