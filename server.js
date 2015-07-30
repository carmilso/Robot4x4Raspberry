var express = require('express');
var path    = require('path');
var app     = express();


app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render(path.join(__dirname+'/index'), {
		title: 'Prueba',
		text: 'Hi! This is a prove to view the new html form.'
	});
});

var server = app.listen(3000, function() {
	console.log('Server started');
});

process.on('SIGINT', function() {
	server.close();
	console.log('Server disconnected.');
	process.exit(0);
})
