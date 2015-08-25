module.exports = function(socket) {

	var usersConnected = 0;
	var robotState = 'stop';

	socket.on('connection', function(user) {
	        console.log('[SOCKET] User connected\n');

		usersConnected++;

		var info = getInfo(usersConnected);

		socket.emit('usersConnected', usersConnected + info);

		var state = actualState(robotState);
		user.emit('actualState', state);

		user.on('arrow', function(state) {
			var aState = actualState(state);
			socket.emit('actualState', aState);
		});

		user.on('disconnect', function() {
			console.log('[SOCKET] User disconnected\n');
			usersConnected--;

			var info = getInfo(usersConnected);

			socket.emit('usersConnected', usersConnected + info);
		});

	});
};

function actualState(robotState) {
	if (robotState == 'stop')
		return 'stop'

	var angle = '0';

	if (robotState == 'down')
		angle = 180;
	else if (robotState == 'left')
		angle = 270;
	else if (robotState == 'right')
		angle = 90;

	return angle;
	//return '<span class="arrow-success-large" data-angle="' + angle + '"></span>'
}

function getInfo(usersConnected) {
	var info = usersConnected == 1 ? ' user online' : ' users online';
	return info;
}
