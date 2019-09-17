var session = require('express-session');
var passport = require('passport');
var sop = require('simple-object-path');

function redisProtect(req, res, next) {
    res.header('Cache-Control', 'no-cache');
    const token = sop(req.session, 'passport/user/accessToken');
    const user_id = sop(req.session, 'passport/user/user_id');
    const id = sop(req.session, 'passport/user/id');
    //console.log(req.session);
    if (!token && !user_id && !id) {
        const redirectUrl = 'https://auth.crosshj.com/';
        const redirectTo = 'https://cents.crosshj.com' + req.originalUrl;
        if(req.session){
            req.session.redirectTo = redirectTo;
        }
        return res.redirect(redirectUrl);
    }
    res.locals.token = token;
    res.locals.user_id = user_id;
    res.locals.id = id;
    next();
}

function redisSession(settings) {
    const RedisStore = require('connect-redis')(session);
    return session({
        secret: settings.cookieSecret,
        name: 'gAuthSess',
        store: new RedisStore({
            host: 'redis',
            port: 6379
        }),
        resave: false,
        saveUninitialized: true,
        cookie: {
            path: '/',
            domain: '.crosshj.com'
        }
    });
}

function fileStoreSession(settings) {
    var store = ((sess) => {
        const FileStore = require('session-file-store')(sess);
        const fileStoreOptions = {
            path: settings.folderLocation
        };
        const store = new FileStore(fileStoreOptions);
        return store;
    })(session);
    return session({
        secret: settings.cookieSecret,
        store,
        resave: false,
        saveUninitialized: false
    });
}

function mongoSession(settings) {
    var store = ((sess) => {
        var MongoDBStore = require('connect-mongodb-session')(sess);
        const connectErrorCallback = (error) => {
            if (error) {
                console.log({ mongoConnectError: error });
            }
        };
        var store = new MongoDBStore({
            uri: 'mongodb://ubuntu:27017',
            databaseName: 'cents',
            collection: 'sessions'
        }, connectErrorCallback);
        store.on('error', connectErrorCallback);
        return store;

    })(session);
    session({
        secret: settings.cookieSecret,
        store,
        resave: false,
        saveUninitialized: false
    });
}


class AppSession {
    constructor(app, store, settings) {
        this.store = store;

        const whichSession = {
            mongo: mongoSession,
            redis: redisSession,
            file: fileStoreSession
        }[store] || fileStoreSession;

        this.express = whichSession(settings);
        app.use(this.express);
        app.use(passport.initialize());
        app.use(passport.session());

        if(store === 'mongo' || store === 'file'){
            var authentication = require('./authentication');
            authentication.init(app);
        }

        if(store === 'redis'){
            passport.serializeUser(function (user, done) {
                done(null, user);
              });

            passport.deserializeUser(function (user, done) {
            done(null, user);
            });
        }

        const passportProtect = passport.authenticationMiddleware
            ? passport.authenticationMiddleware()
            : (req, res, next) => next('error with passport authenticationMiddleware')
        const whichProtect = {
            mongo: passportProtect,
            redis: redisProtect,
            file: passportProtect
        }[store] || passportProtect;

        this.protect = whichProtect;
    }
}

module.exports = AppSession;
