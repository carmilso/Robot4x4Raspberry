exports.loadUsers = function(callback) {

}

exports.findUser = function(username, password, callback) {
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

exports.checkUser = function(username, callback) {

}

exports.signUp = function(username, password, ip, callback) {
	db.query(
        'INSERT INTO users (Username, Password, IP) VALUES (?, ?, ?)',
        [username, password, ip],
        function(err, result) {
			if (err) callback(err, null);
			else callback(null, result);
        }
    );
}
