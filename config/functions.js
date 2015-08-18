var mysql           = require('mysql');
var twilio          = require('twilio');
var twilioCodes     = require('../private/twilioCodes')
var dataBaseInfo    = require('../private/database');


var usersToRegister = [];

var db = mysql.createPool({
	host: dataBaseInfo.host,
	user: dataBaseInfo.user,
	password: dataBaseInfo.password,
	database: dataBaseInfo.database
});

var clientTwilio = new twilio.RestClient(twilioCodes.account_sid, twilioCodes.auth_token);


/* Sends a sms to the admin with the verification code needed to sign up */
exports.smsCode = function(username, code, callback) {
	console.log('[INFO] Verification code for <' +username + '>: ' + code + '\n');

	clientTwilio.sms.messages.create({
		to: twilioCodes.to,
		from: twilioCodes.from,
		body: 'Verification code for <' +username + '>: ' + code
	}, function(err, msg) {
		return callback(err, msg);
	});
}

/* Loads the users with their passwords from the DataBase */
exports.loadUsers = function(callback) {
	db.getConnection(function(err, connection) {
		if (!err) {
			connection.query(
			'SELECT Username, AES_DECRYPT(Password, ?) AS Password, IP FROM users',
			[dataBaseInfo.secret],
			function(err, result) {
				return callback(err, result);
			});
		}
		else {
			console.log('[ERROR] Loading users: ' + err);
			return callback(err, null);
		}
	});
}

/* Searchs an specific user in main memory (variable users) */
exports.findUser = function(username, users, callback) {
	var res = false;

	users.forEach(function(item) {
		if (item.Username == username){
			res = item;
		}
	});

	callback(res);
}

/* Signs up a new user in the DataBase */
exports.signUp = function(username, password, ip, callback) {
	db.getConnection(function(err, connection) {
		if (!err) {
			connection.query(
        		'INSERT INTO users (Username, Password, IP) VALUES (?, AES_ENCRYPT(?, ?), ?)',
        		[username, password, dataBaseInfo.secret, ip],
        		function(err) {
				if (err)
					callback(err, null);
				else
					callback(null, {Username: username, Password: password});
			});
		}
		else
			callback(err, {Username: username, Password: password, IP: ip});
    });
};

exports.registerUser = function(username, password, ip, callback) {
        db.getConnection(function(err, connection) {
                if (!err) {
                        connection.query(
                        'INSERT INTO users (Username, Password, IP) VALUES (?, AES_ENCRYPT(?, ?), ?)',
                        [username, password, dataBaseInfo.secret, ip],
                        function(err) {
                                if (err)
                                        callback(err);
								else
										callback(false);
                		});
                }
	});
}

/* Ends the connection with the DataBase in a safe way */
exports.endDB = function() {
	db.end();
}
