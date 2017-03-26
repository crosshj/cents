var logger = require('logger');
var scrapers = require('./scrapers');
var db = require('./database');
var async = require('async');

var log = logger.createLogger(
  require('path').join(__dirname, 'scrape.log')
);
log.format = function(level, date, message) {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString().replace(/-/g,'').replace(/T/g,' ').substr(0,17)
      + " [" + level + "]: "
      + message;
};

function scrape() {
  db.init({
    collectionName: 'records'
  });

  const pushResults = (context, callback) => (err, data) => {
    const result = {
      err, data, context,
      date: new Date(new Date().getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString().replace(/-/g,'').replace(/T/g,' ').substr(0,17)
      //date: new Date().valueOf()
    };
    callback(null, result);
  };

  var queue = [
    callback => scrapers.usaa(pushResults('usaa', callback))
  ];

  async.parallel(queue, function(err, results) {
    // also don't write results if we already have
    // don't write blank results to DB, in case of error(?)
    db.read({
      query: '',
      callback: (err, result) => {
        const scrapedUSAABalance = results[0].data.accounts[0].balance;
        const lastDBUSAABalance = result[result.length-1].data.accounts[0].balance;
        if (scrapedUSAABalance === lastDBUSAABalance){
          log.info('good scrape - already had data');
          return;
        }

        if (results[0].data) {
          log.info('good scrape');
          db.create({docs: results, callback: ()=>{}});
        } else {
          log.error('bad scrape');
        }
      }
    });

  });

  //TODO: get/set private info from/in database

}

//module.exports = scrape;
scrape()
