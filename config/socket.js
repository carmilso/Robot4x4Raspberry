module.exports = function(socket) {

	var usersConnected = 0;
	var robotStates = ['stop', 'up', 'down', 'left', 'right'];
	var robotState = robotStates[0];

	socket.on('connection', function(user) {
        console.log('[SOCKET] User connected');
		usersConnected++;

		socket.emit('usersConnected', usersConnected);

		var state = actualState(robotState);

		user.emit('actualState', state);

		user.on('disconnect', function() {
			console.log('[SOCKET] User disconnected');
			usersConnected--;
			socket.emit('usersConnected', usersConnected);
		});

	});
};

function actualState(robotState) {
	if (robotState == 'stop')
		return '<h3>Stopped</h3>'

	var angle = '';

	if (robotState == 'down')
		angle = 180;
	else if (robotState == 'left')
		angle = 270;
	else if (robotState == 'right')
		angle = 90;

	return '<span class="arrow-success-large" data-angle="' + angle + '" id="arrowState"></span>'
}
