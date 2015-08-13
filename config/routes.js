var fns             = require('./functions');
var path            = require('path');
var passport        = require('passport');
var LocalStrategy   = require('passport-local').Strategy;


module.exports = function(app, verifyCodes, users) {

	/* Main page where users can sign in or sign up */
	app.get('/', function(req, res) {
		res.render(path.join(__dirname+'/../views/login'), {
			errorMessage: req.flash('loginMessage'),
			verifiedMessage: req.flash('verifiedMessage')
		});
	});

	/* Page where users can sign up */
	app.get('/register', function(req, res) {
		res.render(path.join(__dirname+'/../views/register'), {
			errorMessage: req.flash('errorMessage')
		});
	});

	/* Generates a random verification code and redirects the user to the verification page */
	app.post('/verify', function(req, res) {
		user = req.body.userR;
		pass = req.body.passwordR;

		console.log('[INFO] User: ' + user);
		console.log('[INFO] Password: ' + pass);

		var code = Math.random().toString(36).substring(2, 9);

		fns.smsCode(user, code, function(err, msg) {
			if (err)
				console.log('[ERROR] An error ocurred sending the sms: ' + err);
		});

		verifyCodes[user] = [code, pass];

		res.render(path.join(__dirname+'/../views/verify.ejs'), {
			userR: user
		});
	});

	/* Check if the username tried to sign up exists in the DataBase */
	app.post('/validateUsername', function(req, res) {
		var data = JSON.parse(JSON.stringify(req.body));

		var username = data.username;

		fns.findUser(username, users, function(data) {
			if (data)
				res.send(JSON.stringify({accepted: false, msg: '<span>error: </span>This username already exists. Please, try another one.'}));
			else
				res.send(JSON.stringify({accepted: true, msg: ''}));
		});
	});

	/* If the verification code matches with the server, the user is signed up */
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
			fns.signUp(user, pass, ip, function(err, data) {
				if (err){
					console.log('[ERROR] Error on database: ' + err + '\n');

					var info = "Error in DataBase. Please, contact with the admin";
					req.flash('errorMessage', info);

					res.send(JSON.stringify({redirect: true, address: '/register'}));
				}
				else{
					console.log('[INFO] User signed up correctly!\n');

					users.push(data);

					req.flash('verifiedMessage', 'Successfully signed up! You can now sign in...');

					res.send(JSON.stringify({redirect: true, address: '/'}));
				}
			});
		}

	});

	/* Loggin configuration */
	app.post('/login',
        passport.authenticate('local', { successRedirect: '/',
                                         failureRedirect: '/',
                                         failureFlash: true,
                                         successFlash: true
		})
	);

}
