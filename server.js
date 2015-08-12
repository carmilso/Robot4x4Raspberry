console.log('[INFO] Initializing Server...');


/***********************************************************************/
var fns             = require('./config/functions');
var express	        = require('express');


/***********************************************************************/
var app = express();
var verifyCodes = {};
var users = [];

fns.loadUsers(function(err, data) {
	if (err) {
		console.log('[ERROR] Not possible to connect to the DataBase:');
		console.log(err + '\n');
		process.kill(process.pid, 'SIGINT');
	}
	else {
		data.forEach(function(item) {
			users.push(item.Username);
		});
	}
});


/***********************************************************************/
require('./config/passport')(app);
require('./config/routes')(app, verifyCodes, users);


/***********************************************************************/
var server = app.listen(3000, function() {
	console.log('[INFO] Server started!\n');
});

process.on('SIGINT', function() {
	server.close();
	fns.endDB();
	console.log('[INFO] Server disconnected.');
	process.exit(0);
});
