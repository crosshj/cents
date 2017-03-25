var db = require('../database');

module.exports = function(app) {
    app.get('/accounts', function(req, res) {
      db.init({
        collectionName: 'records',
        callback: () => {
          db.read({
            query: '',
            callback: (err,result) => {
              res.send(result[result.length-1]);
            }
          });
        }
      });
    });
}
