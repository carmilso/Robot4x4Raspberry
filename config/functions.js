var mysql           = require('mysql');
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
	clientTwilio.sms.messages.create({
		to: twilioCodes.to,
		from: twilioCodes.from,
		body: 'Verification code for <' +username + '>: ' + code
	}, function(err, msg) {
		callback(err, msg);
	});
}

exports.loadUsers = function(callback) {

}

exports.findUser = function(username, password, callback) {
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
}

exports.checkUser = function(username, callback) {

}

exports.signUp = function(username, password, ip, callback) {
	db.query(
        'INSERT INTO users (Username, Password, IP) VALUES (?, AES_ENCRYPT(?, ?), ?)',
        [username, password, dataBaseInfo.secret, ip],
        function(err, result) {
			if (err) callback(err, null);
			else callback(null, result);
        }
    );
}

exports.endDB = function() {
	db.end();
}
