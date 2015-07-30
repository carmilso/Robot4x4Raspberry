var path			= require('path');
var express			= require('express');
var passport		= require('passport');
var bodyParser		= require('body-parser');
var LocalStrategy	= require('passport-local').Strategy;

var app = express();


app.set('view engine', 'ejs');

app.use('/login/css', express.static(path.join(__dirname, 'login/css')));

app.use(bodyParser.urlencoded({ extended: false }));

/*app.get('/', function(req, res) {
	console.log('Connected: ' + req.connection.remoteAddress);

	res.render(path.join(__dirname+'/index'), {
		title: 'Testing ExpressJS',
		text: 'Hi! This is a prove to view the new html form.'
	});
});*/

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

	res.sendFile(path.join(__dirname+'/login/verify.html'));
});

app.get('/validate', function(req, res) {
	var code = Math.random().toString(36).substring(2, 9);
	console.log('Verification code: ' + code);
});

app.get('/request', function(req, res) {
	var val = req.query['value'];
	res.send('Value introduced: ' + val);
});

var server = app.listen(3000, function() {
	console.log('Server started');
});

process.on('SIGINT', function() {
	server.close();
	console.log('Server disconnected.');
	process.exit(0);
})
