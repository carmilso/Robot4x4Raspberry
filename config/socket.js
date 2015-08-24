module.exports = function(socket) {

	socket.on('connection', function(client) {
        	console.log('[SOCKET] User connected');
		client.on('disconnect', function() {
			console.log('[SOCKET] User disconnected');
		});
	});
};
