const fs = require('fs');
const path = require('path');

const DIFF_LOG_LOCATION = path.resolve(__dirname, '../../diffs.log');

function getDiffs(req, res) {
  fs.readFile(DIFF_LOG_LOCATION, 'utf-8', (err, file) => {
    if (err) {
      return res.send(err);
    }

    try {
      const lines = file
        .split('\n')
        .slice(0, -1)
        .map(item => JSON.parse(item));

      res.setHeader('content-type', 'text/plain');
      res.send(lines);
    } catch (e) {
      //console.log(`error with sending lines from ${DIFF_LOG_LOCATION}: ${e}`);
      res.send(e);
    }
  });
}

module.exports = function (app, passport) {
  app.get('/diffs', passport.authenticationMiddleware(), getDiffs);
};