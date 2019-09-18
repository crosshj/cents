var passport = require('passport');

// module.exports = function(app, passport) {
//   app.post('/login', passport.authenticate('local', {
//     successReturnToOrRedirect: './',
//     failureRedirect: '../login'
//   }));
// };

module.exports = function(app, protect){
  app.get('/login$', function(req, res, next){
    // handled by express.static after this
    return res.redirect('./login/');
  });

  app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      console.log({ err, user, info });
      if (err) { return next(err); }
      if (!user) {
        if (/json/.test(req.headers.accept)) {
          res.json({ status: 'no user' });
          return;
        }
        return res.redirect('./login');
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }

        if (/json/.test(req.headers.accept)) {
          res.json({ status: 'logged in' });
          return;
        }

        return res.redirect('./');
      });
    })(req, res, next);
  });
};
