var fns             = require('./functions');
var path            = require('path');
var flash           = require('connect-flash');
var express	    = require('express');
var session         = require('express-session');
var passport        = require('passport');
var bodyParser      = require('body-parser');
var LocalStrategy   = require('passport-local').Strategy;



module.exports = function(app, users) {

    passport.use(new LocalStrategy ({
    	usernameField: 'login__username',
    	passwordField: 'login__password',
    	passReqToCallback: true
    },
    function(req, username, password, done) {
    	fns.findUser(username, users, function(user) {
    		if (!user) return done(null, false, req.flash('loginMessage', 'This Username does not exist'));
    		if (user.Password != password) return done(null, false, req.flash('loginMessage', 'The password is not correct'));
		return done(null, user.Username);
    	});
    }
    ));

    passport.serializeUser(function(user, done) {
    	done(null, user);
    });

    passport.deserializeUser(function(user, done) {
    	done(null, user);
    });

    app.set('view engine', 'ejs');

    app.use('/styles', express.static(path.join(__dirname, '/../views/css')));

    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(bodyParser.json());

    app.use(session({
    	secret: 'cat sleeping',
    	name: 'cookie_Raspberry',
    	resave: true,
    	saveUninitialized: true
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());

}
