var scrapers = require('./scrapers');
var db = require('./database');
var async = require('async');

db.init({
  collectionName: 'records'
});

const pushResults = (context, callback) => (err, data) => {
  const result = {
    err, data, context,
    date: new Date().valueOf()
  };
  callback(null, result);
};

var queue = [
  callback => scrapers.usaa(pushResults('usaa', callback))
];

async.parallel(queue, function(err, results) {
  db.create({docs: results});
});

//TODO: express API read from DB
//TODO: only add new transactions, parse results better before writing to DB
