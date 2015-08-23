console.log('[INFO] Initializing Server...');


/***********************************************************************/
var io          = require('socket.io');
var fns         = require('./config/functions');
var express     = require('express');


/***********************************************************************/
var app = express();
var verifyCodes = {};
var users = [];
var usersToRegister = [];
usersLogged = [];

/* Loads the users and their passwords in main memory from the DataBase */
fns.loadUsers(function(err, data) {
	if (err) {
		console.log('[ERROR] Not possible to connect to the DataBase:');
		console.log(err + '\n');
		process.kill(process.pid, 'SIGINT');
	}
	else {
		data.forEach(function(item) {
			users.push(item);
		});
	}
});


/***********************************************************************/
require('./config/configuration')(app, users);
require('./config/routes')(app, verifyCodes, users, usersToRegister);


/***********************************************************************/
var server = app.listen(3000, function() {
	console.log('[INFO] Server started!\n');
});

var socket = io.listen(server);

socket.on('connection', function(client) {
	console.log('[INFO] Socket connected: ' + client);
});

process.on('SIGINT', function() {
	server.close();
	fns.endDB();
	console.log('[INFO] Server disconnected.');
	process.exit(0);
});
