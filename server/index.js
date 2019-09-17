/* istanbul ignore file */

var express = require('express');
var serverStart = require('./server');
var app = express();

var settings = {
  cookieSecret: process.env.COOKIE_SECRET || require('crypto').randomBytes(64).toString('hex'),
  folderLocation:  './service/database/data',
  appPort: process.env.PORT || 8070
};
// console.log({
//   settings
// });

//var cron = require('../service/cron');
//cron();
serverStart(app, settings);
