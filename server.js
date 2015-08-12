console.log('[INFO] Initializing Server...');


/***********************************************************************/
var fns             = require('./config/functions');
var express	        = require('express');


/***********************************************************************/
var app = express();
var verifyCodes = {};
fns.loadUsers();


/***********************************************************************/
require('./config/passport')(app);
require('./config/routes')(app, verifyCodes);


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
