module.exports = function(app) {
    //TODO: this should be protected
    app.get('/restart', function (req, res, next) {
      const timeout = 2;

      res.send(`restarting in ${timeout} seconds`);
      setTimeout(function() {
        process.exit(1);
      }, timeout * 1000);
    });
};
