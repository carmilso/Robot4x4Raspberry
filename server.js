var path		= require('path');
var mysql		= require('mysql');
var express		= require('express');
var passport		= require('passport');
var bodyParser		= require('body-parser');
var dataBaseInfo	= require('./private/database');
var LocalStrategy	= require('passport-local').Strategy;


var app = express();

app.set('view engine', 'ejs');

app.use('/login/css', express.static(path.join(__dirname, 'login/css')));

app.use(bodyParser.urlencoded({ extended: false }));

var verifyCodes = {};

var db = mysql.createConnection({
	host: dataBaseInfo.host,
	user: dataBaseInfo.user,
	password: dataBaseInfo.password,
	database: dataBaseInfo.database
});

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
	console.log('Connected: ' + req.connection.remoteAddress);

	res.sendFile(path.join(__dirname+'/login/login.html'));
});

app.get('/register', function(req, res) {
	if (req.query.warn == true)
		res.render(path.join(__dirname+'/login/register'), {
			warn: '1',
			message: req.query.msg
		});
	else
		res.render(path.join(__dirname+'/login/register'), {
			warn: '0',
			message: req.query.msg
		});
});

app.post('/verify', function(req, res) {
	console.log('User: ' + req.body.userR);
	console.log('Password: ' + req.body.passwordR);

	var code = Math.random().toString(36).substring(2, 9);
	console.log('Verification code: ' + code);

	verifyCodes[req.body.userR] = [code, req.body.passwordR];

	res.render(path.join(__dirname+'/login/verify.ejs'), {
		userR: req.body.userR
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
					? "The+user+already+exists" : "Error in DataBase."

                res.redirect('/register?warn=1&msg='+info);
			}
			else{
				console.log('User signed up correctly!');
                res.redirect('/');
			}
		});
	}
	else {
		console.log("Not same code...");
		res.redirect('/register?warn=1&msg=Verification+code+does+not+match!');
	}
});
/***********************************************************************/


var server = app.listen(3000, function() {
	console.log('Server started');
});

process.on('SIGINT', function() {
	server.close();
	db.end();
	console.log('Server disconnected.');
	process.exit(0);
})
