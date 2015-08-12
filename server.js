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

app.use('style', express.static(path.join(__dirname, '/views/css')));
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
app.get('/', function(req, res) {
	res.render(path.join(__dirname+'/views/login'), {
		errorMessage: req.flash('loginMessage'),
		verifiedMessage: req.flash('verifiedMessage')
	});
});

app.get('/register', function(req, res) {
	res.render(path.join(__dirname+'/views/register'), {
		errorMessage: req.flash('errorMessage')
	});
});

app.post('/verify', function(req, res) {
	user = req.body.userR;
	pass = req.body.passwordR;

	// Check if user exists in database


	console.log('[INFO] User: ' + user);
	console.log('[INFO] Password: ' + pass);

	var code = Math.random().toString(36).substring(2, 9);
	console.log('[INFO] Verification code: ' + code + '\n');

	verifyCodes[user] = [code, pass];

	res.render(path.join(__dirname+'/views/verify.ejs'), {
		userR: user
	});
});

app.post('/validateCode', function(req, res) {
	var data = JSON.parse(JSON.stringify(req.body));

	var user = data.user;
	var pass = verifyCodes[user][1];
	var code = data.code;
	var ip = req.connection.remoteAddress;

	console.log('[INFO] Received: ' + code + ', ' + user + '\n');

	if (code != verifyCodes[user][0])
		res.send(JSON.stringify({redirect: false, msg: '<span>error: </span>The verification code does not match with the server.'}));
	else {
		signUp(user, pass, ip, function(err, data) {
			if (err){
				console.log('[ERROR] Error on database: ' + err + '\n');
				var info = err.toString().search("ER_DUP_ENTRY") != -1
					? "The user already exists. Try with another one!" : "Error in DataBase.";

				req.flash('errorMessage', info);
				res.send(JSON.stringify({redirect: true, address: '/register'}));
			}
			else{
				console.log('[INFO] User signed up correctly!\n');
				req.flash('verifiedMessage', 'You have successfully signed up! You can now log in...');
				res.send(JSON.stringify({redirect: true, address: '/'}));
			}
		});
	}

});

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
