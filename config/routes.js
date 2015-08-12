module.exports = function(app, path, flash) {

app.get('/', function(req, res) {
	console.log(__dirname+'/views/login');
	res.render(path.join('../'+__dirname+'/views/login'), {
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

}
