var PythonShell = require('python-shell');


module.exports = function(socket) {

	var usersConnected = 0;
	var robotState = 'stop';

	var robot = iniController();

	socket.on('connection', function(user) {
		console.log('[SOCKET] User connected\n');

		usersConnected++;

		var info = getInfo(usersConnected);

		socket.emit('usersConnected', usersConnected + info);

		var angle = getAngle(robotState);
		user.emit('actualState', angle);

		user.on('arrow', function(state) {
			var aState = getAngle(state);
			robot.send(state + '\n');
			socket.emit('actualState', aState);
		});

		user.on('disconnect', function() {
			console.log('[SOCKET] User disconnected\n');
			usersConnected--;

			var info = getInfo(usersConnected);

			socket.emit('usersConnected', usersConnected + info);
		});

	});

	process.on('SIGINT', function() {
		robot.send('close');
		robot.close();
	});
};


var pythonOptions = {
  mode: 'text',
  pythonPath: '/usr/bin/python',
  scriptPath: '/home/pi/Robot4x4Raspberry/'
};

function iniController(){
  var pyshell = new PythonShell('robot.py', pythonOptions);

  pyshell.on('message', function(message) {
	console.log('[ROBOT] Message: ' + message);
  });

  pyshell.on('error', function(err){
    console.log("[ROBOT] Not possible to communicate with the Robot.\n" + err);
  });

  return pyshell;
}

function getAngle(robotState) {
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
