var path			= require('path');
var express			= require('express');
var passport		= require('passport');
var bodyParser		= require('body-parser');
var LocalStrategy	= require('passport-local').Strategy;


var app = express();

app.set('view engine', 'ejs');

app.use('/login/css', express.static(path.join(__dirname, 'login/css')));

app.use(bodyParser.urlencoded({ extended: false }));

var verifyCodes = {};


/***********************************************************************/
app.get('/', function(req, res) {
	console.log('Connected: ' + req.connection.remoteAddress);

	res.sendFile(path.join(__dirname+'/login/login.html'));
});

app.get('/register', function(req, res) {
	res.sendFile(path.join(__dirname+'/login/register.html'));
});

app.post('/verify', function(req, res) {
	console.log('User: ' + req.body.userR);
	console.log('Password: ' + req.body.passwordR);

	var code = Math.random().toString(36).substring(2, 9);
	console.log('Verification code: ' + code);

	verifyCodes[req.body.userR] = code;

	res.render(path.join(__dirname+'/login/verify.ejs'), {
		userR: req.body.userR
	});
});

app.get('/validate', function(req, res) {
	if (req.query.adminCode == verifyCodes[req.query.userR]){
		console.log("Same code!");
	}
	else {
		console.log("Not same code...");
	}
});
/***********************************************************************/


var server = app.listen(3000, function() {
	console.log('Server started');
});

process.on('SIGINT', function() {
	server.close();
	console.log('Server disconnected.');
	process.exit(0);
})
