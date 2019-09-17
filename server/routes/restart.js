module.exports = function(app, protect) {
    app.get('/restart', protect, function (req, res, next) {
      const timeout = 3;

      res.send(`restarting in ${timeout} seconds`);
      setTimeout(function() {
        process.exit(1);
      }, timeout * 1000);
    });
};
