var db = require('../database');

module.exports = function(app, passport) {
    app.get('/accounts', passport.authenticationMiddleware(), function(req, res) {
      db.init({
        collectionName: 'records',
        callback: () => {
          db.read({
            query: '',
            callback: (err,result) => {
              if(result.length === 0){
                res.send({
                  error: 'no accounts info available from DB',
                  data: {accounts: [{}]}
                });
              } else {
                res.send(result[result.length-1]);
              }
            }
          });
        }
      });
    });
};
