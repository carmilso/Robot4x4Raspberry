module.exports = function(socket) {

	socket.on('connection', function(client) {
        	console.log('[INFO] Socket connected: ' + client);
	});
};
