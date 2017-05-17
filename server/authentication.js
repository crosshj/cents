const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const authenticationMiddleware = function authenticationMiddleware () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      if(!req.cookies.username){
        res.cookie('username', req.user.username, { maxAge: 900000, httpOnly: true });
      }
      return next();
    }
      res.send({ error: 'not logged in' });
      return;
    }

    if (req.session) {
      req.session.returnTo = req.originalUrl || req.url;
    }
    res.redirect('./login');
  };
};


//TODO: should connect to user DB, this is fake
const user = {
  username: 'user',
  password: 'password',
  id: 1
};

function findUser (username, callback) {
  if (username === user.username) {
    return callback(null, user);
  }
  return callback(null);
}

passport.serializeUser(function (user, cb) {
  cb(null, user.username);
});

passport.deserializeUser(function (username, cb) {
  findUser(username, cb);
});

function initPassport () {
  passport.use(new LocalStrategy(
    function(username, password, done) {
      findUser(username, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (password !== user.password  ) {
          return done(null, false);
        }
        return done(null, user);
      });
    }
  ));

  passport.authenticationMiddleware = authenticationMiddleware;
}

module.exports = {init: initPassport};
