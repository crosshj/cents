/*
eslint-disable no-console
*/

var logger = require('logger');
var scrapers = require('./scrapers');
var db = require('./database');
var async = require('async');
var timestamp = require('./utilities/date').stamp;

const DEBUG = true;

var logLocation = require('path').join(__dirname, '../logs/scrape.log');

// don't write results to DB if we already have (USAA)
// don't write blank results to DB, in case of error(?)
function scrapeCallback (err, result, results) {
  var log = logger.createLogger(logLocation);
  log.format = function(level, date, message) {
    return timestamp(date)
        + " [" + level + "]: "
        + message;
  };

  try {
    if (results[0].data) {
      const scrapedUSAABalance = results[0].data.accounts[0].balance;
      const lastDBUSAABalance = result[result.length-1].data.accounts[0].balance;
      if (scrapedUSAABalance === lastDBUSAABalance){
        log.info('good scrape - already had data');
      } else {
        log.info('good scrape');
        db.create({docs: results, callback: ()=>{}});
      }
    } else {
      if (!!~JSON.stringify(results).toLowerCase().indexOf("timed out")){
        log.error('bad scrape - timed out');
      } else {
        log.error('bad scrape - results:', results);
      }
    }
  } catch(err) {
    log.error('bad scrape - error: ', err);
    return;
  }
}

function scrape() {
  if (DEBUG) {
    console.log(timestamp(), ' CRON: executing scrape');
  }

  db.init({
    collectionName: 'records'
  });

  const pushResults = (context, callback) => (err, data) => {
    const result = {
      err, data, context,
      date: timestamp()
    };
    callback(null, result);
  };

  var queue = [
    callback => scrapers.usaa(pushResults('usaa', callback))
  ];

  async.parallel(queue, function(err, results) {
    db.read({
      query: '',
      callback: (err, result) => scrapeCallback(err, result, results)
    });

  });

  //TODO: get/set private info from/in database

}

//module.exports = scrape;
scrape();
