var mysql           = require('mysql');
var twilio          = require('twilio');
var twilioCodes     = require('../private/twilioCodes')
var dataBaseInfo    = require('../private/database');


var db = mysql.createConnection({
	host: dataBaseInfo.host,
	user: dataBaseInfo.user,
	password: dataBaseInfo.password,
	database: dataBaseInfo.database
});

var clientTwilio = new twilio.RestClient(twilioCodes.account_sid, twilioCodes.auth_token);


exports.smsCode = function(username, code, callback) {
	console.log('[INFO] Verification code for <' +username + '>: ' + code + '\n');

	clientTwilio.sms.messages.create({
		to: twilioCodes.to,
		from: twilioCodes.from,
		body: 'Verification code for <' +username + '>: ' + code
	}, function(err, msg) {
		callback(err, msg);
	});
}

exports.loadUsers = function(callback) {
	db.query(
		'SELECT Username FROM users',
		function(err, result) {
			callback(err, result);
		}
	);
}

/*exports.findUser = function(username, password, callback) {
	db.query(
		'SELECT * FROM users WHERE Username LIKE ? AND Password LIKE AES_ENCRYPT(?, ?)',
		[username, password, dataBaseInfo.secret],
		function(err, result) {
			if (err) callback(err, null);
			else if (result.length == 0) callback(null, 0);
			else{
				res = JSON.parse(JSON.stringify(result[0]));
				callback(null, res.Username);
			}
		}
	);
}*/

exports.findUser = function(username, users, callback) {
	if (users.indexOf(username) != -1)
		callback(true);
	else
		callback(false);
}

exports.checkUser = function(username, callback) {

}

exports.signUp = function(username, password, ip, callback) {
	db.query(
        'INSERT INTO users (Username, Password, IP) VALUES (?, AES_ENCRYPT(?, ?), ?)',
        [username, password, dataBaseInfo.secret, ip],
        function(err) {
			if (err)
				callback(err, null);
			else
				callback(null, username);
        }
    );
}

exports.endDB = function() {
	db.end();
}
