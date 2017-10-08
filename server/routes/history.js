const fs = require('fs');
const path = require('path');

const DIFF_LOG_LOCATION = path.resolve(__dirname, '../../diffs.log');

//(+date)delta/liabilities/changes/(+key)(?update)changes/(?amount)(+value)(+oldValue)update
// -> { date, key, value, oldValue }
function filterDiffs(lines, type, fields, account){
  const diffs = lines
    .filter(x => x.delta.length > 0)
    .reduce((out, x) => {
      x.delta
        .filter(d => d.changes && d.changes.length > 0)
        .filter(d => d.key === type)
        .forEach(d => {
            d.changes
              .filter(lc => lc.changes && lc.changes.length > 0)
              .filter(lc => !account || lc.key.toLowerCase() === account.toLowerCase())
              .forEach(lc => {
                lc.changes
                  .filter(ic => fields.includes(ic.key))
                  .filter(ic => 
                    ic.oldValue && ic.value
                    && Number(ic.oldValue) !== Number(ic.value))
                  .forEach(ic => {
                    out.push({
                      date: x.date,
                      account: lc.key,
                      field: ic.key,
                      value: ic.value,
                      oldValue: ic.oldValue
                    })
                  })
              })
        })
      return out;
    }, []);
  return diffs;
}

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
      const fields = req.query.field || ['amount', 'total_owed'];
      const account = req.query.account;
      const type = req.query.type || 'liabilities';
      const diffs = filterDiffs(lines, type, fields, account);
      res.send(diffs);
    } catch (e) {
      //console.log(`error with sending lines from ${DIFF_LOG_LOCATION}: ${e}`);
      res.send(e);
    }
  });
}

module.exports = function (app, passport) {
  app.get('/diffs', passport.authenticationMiddleware(), getDiffs);
};