// module.exports = function(app, passport) {
//   app.post('/login', passport.authenticate('local', {
//     successReturnToOrRedirect: './',
//     failureRedirect: '../login'
//   }));
// };

module.exports = function(app, passport){
  app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) {
        if (/json/.test(req.headers.accept)) {
          res.send({ status: 'no user' });
          return;
        }
        return res.redirect('/login');
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }

        if (/json/.test(req.headers.accept)) {
          res.send({ status: 'logged in' });
          return;
        }

        return res.redirect('./');
      });
    })(req, res, next);
  });
}