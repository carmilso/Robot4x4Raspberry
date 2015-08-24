module.exports = function(socket) {

	var usersConnected = 0;
	var robotStates = ['stop', 'up', 'down', 'left', 'right'];
	var robotState = robotStates[0];

	socket.on('connection', function(user) {
        console.log('[SOCKET] User connected\n');
		usersConnected++;

		socket.emit('usersConnected', usersConnected + ' users online');

		var state = actualState(robotState);
		user.emit('actualState', state);

		user.on('arrow', function(state) {
			console.log('Received: ' + state);
			var aState = actualState(state);
			console.log('aState: ' + aState);
			socket.emit('actualState', aState);
		});

		user.on('disconnect', function() {
			console.log('[SOCKET] User disconnected\n');
			usersConnected--;

			socket.emit('usersConnected', usersConnected);
		});

	});
};

function actualState(robotState) {
	if (robotState == 'stop')
		return 'stop'

	var angle = '';

	if (robotState == 'down')
		angle = 180;
	else if (robotState == 'left')
		angle = 270;
	else if (robotState == 'right')
		angle = 90;

	return angle;
	//return '<span class="arrow-success-large" data-angle="' + angle + '"></span>'
}
