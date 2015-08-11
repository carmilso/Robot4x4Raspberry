var path            = require('path');
var flash           = require('connect-flash');
var mysql           = require('mysql');
var express	        = require('express');
var session         = require('express-session');
var passport        = require('passport');
var bodyParser      = require('body-parser');
var dataBaseInfo    = require('./private/database');
var LocalStrategy   = require('passport-local').Strategy;


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
			console.log('User received: ' + user);
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

app.use('/login/css', express.static(path.join(__dirname, 'login/css')));
app.use(bodyParser.urlencoded({ extended: false }));
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

function findUser(username, password, callback) {
	db.query(
		'SELECT * FROM users WHERE Username LIKE ? AND Password LIKE ?',
		[username, password],
		function(err, result) {
			if (err) callback(err, null);
			else if (result.length == 0) callback(null, 0);
			else{
				res = JSON.stringify(result[0]);
				console.log('Result stringify: ' + res);
				user = JSON.parse(res)
				console.log('Result username: ' + user.Username);
				callback(null, user.Username);
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
app.post('/communication', function(req, res) {
	var codeA = JSON.stringify(req.body);
	console.log(req.body.data);
	console.log('Code -> ' + JSON.stringify(req.body));
	res.send('okay');
});

app.get('/', function(req, res) {
	res.render(path.join(__dirname+'/login/login'), {
		errorMessage: req.flash('loginMessage'),
		verifiedMessage: req.flash('verifiedMessage')
	});
});

app.get('/register', function(req, res) {
	res.render(path.join(__dirname+'/login/register'), {
		errorMessage: req.flash('errorMessage')
	});
});

app.post('/verify', function(req, res) {
	user = req.body.userR;
	pass = req.body.passwordR;

	// Check if user exists in database


	console.log('User: ' + user);
	console.log('Password: ' + pass);

	var code = Math.random().toString(36).substring(2, 9);
	console.log('Verification code: ' + code);

	verifyCodes[user] = [code, pass];

	res.render(path.join(__dirname+'/login/verify.ejs'), {
		userR: user
	});
});

app.get('/validate', function(req, res) {
	if (req.query.codeAdmin == verifyCodes[req.query.userR][0]){
		console.log("\nSigning up...");

		user = req.query.userR;
		pass = verifyCodes[user][1];
		ip = req.connection.remoteAddress;

		signUp(user, pass, ip, function(err, data) {
			if (err){
				console.log('Error on database: ' + err);
				var info = err.toString().search("ER_DUP_ENTRY") != -1
					? "The user already exists. Try with another one!" : "Error in DataBase.";

				req.flash('errorMessage', info);
				res.redirect('/register');
			}
			else{
				console.log('User signed up correctly!');
				req.flash('verifiedMessage', 'You have successfully signed up! You can now log in...');
				res.redirect('/');
			}
		});
	}
	else {
		console.log("Not same code...");
		req.flash('errorMessage', 'The verification code does not match with the server.');
		res.redirect('/register');
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
	console.log('Server started');
});

process.on('SIGINT', function() {
	server.close();
	db.end();
	console.log('Server disconnected.');
	process.exit(0);
});
