var path            = require('path');
var flash           = require('connect-flash');
var mysql           = require('mysql');
var express	        = require('express');
var session         = require('express-session');
var passport        = require('passport');
var bodyParser      = require('body-parser');
var dataBaseInfo    = require('./private/database');
var LocalStrategy   = require('passport-local').Strategy;


console.log('[INFO] Initializing Server...');

/***********************************************************************/
passport.use(new LocalStrategy ({
	usernameField: 'login__username',
	passwordField: 'login__password',
	passReqToCallback: true
},
function(req, username, password, done) {
	findUser(username, password, function(err, user) {
		if (err) return done(err);
		if (!user) return done(null, false, req.flash('loginMessage', 'Incorrect username or password'));
		if (user){
			return done(null, user);
		}
	});
}
));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

var app = express();

app.set('view engine', 'ejs');

app.use('/styles', express.static(path.join(__dirname, '/views/css')));
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


/***********************************************************************/
var verifyCodes = {};

var db = mysql.createConnection({
	host: dataBaseInfo.host,
	user: dataBaseInfo.user,
	password: dataBaseInfo.password,
	database: dataBaseInfo.database
});

function loadUsers(callback){

}

function findUser(username, password, callback) {
	db.query(
		'SELECT * FROM users WHERE Username LIKE ? AND Password LIKE ?',
		[username, password],
		function(err, result) {
			if (err) callback(err, null);
			else if (result.length == 0) callback(null, 0);
			else{
				res = JSON.parse(JSON.stringify(result[0]));
				callback(null, res.Username);
			}
		}
	)
}

function checkUser(username, callback) {

}

function signUp(username, password, ip, callback) {
	db.query(
        'INSERT INTO users (Username, Password, IP) VALUES (?, ?, ?)',
        [username, password, ip],
        function(err, result) {
			if (err) callback(err, null);
			else callback(null, result);
        }
    );
}


/***********************************************************************/
require('./config/routes')(app);

app.post('/login',
	passport.authenticate('local', { successRedirect: '/',
									 failureRedirect: '/',
									 failureFlash: true,
									 successFlash: true
	})
);


/***********************************************************************/
var server = app.listen(3000, function() {
	console.log('[INFO] Server started!\n');
});

process.on('SIGINT', function() {
	server.close();
	db.end();
	console.log('[INFO] Server disconnected.');
	process.exit(0);
});
