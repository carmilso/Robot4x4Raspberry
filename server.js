var express = require('express');
var path    = require('path');
var app     = express();


app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	console.log('Connected: ' + req.connection.remoteAddress);
	
	res.render(path.join(__dirname+'/index'), {
		title: 'Testing ExpressJS',
		text: 'Hi! This is a prove to view the new html form.'
	});	
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
