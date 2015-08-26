var PythonShell = require('python-shell');

var pythonOptions = {
  mode: 'text',
  pythonPath: '/usr/bin/python',
  scriptPath: '/home/pi/Robot4x4Raspberry/'
};

var usersConnected = 0;
var usernames = [];
var robotState = 'stop';


module.exports = function(socket) {

	var robot = iniController();

	socket.on('connection', function(user) {

		user.on('username', function(data) {
			var res = updateData(user, data);

			user.emit('actualState', res.angle);

			socket.emit('usersConnected', {usersInt: usersConnected+res.info, usersVector: res.usernames});
		});

		user.on('arrow', function(state) {
			var aState = getAngle(state);
			robot.send(state+'\n');
			socket.emit('actualState', aState);
		});

		user.on('disconnect', function() {
			//console.log('[SOCKET] User disconnected\n');
			usersConnected--;

			console.log('[SOCKET] User disconnected: ' + getUsernameByID(user.id) + '\n');

			usernames.slice(getUserPositionByID(user.id), 1);

			var info = getInfo(usersConnected);

			socket.emit('usersConnected', {usersInt: usersConnected+res.info, usersVector: res.usernames});
		});

	});

	process.on('SIGINT', function() {
		robot.send('close');
		robot.end(0);
	});
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

function updateData(user, data) {
	usernames.push({ id: user.id, user: data });

	console.log('[SOCKET] User connected: ' + data + '\n');

	usersConnected++;

	var info = getInfo(usersConnected);
	var angle = getAngle(robotState);

	var usernamesOnline = [];
	usernames.forEach(function(item) {
		usernamesOnline.push(item.user);
	});

	return {
		info: info,
		angle: angle,
		usernames: usernamesOnline
	}
}

function getAngle(robotState) {
	if (robotState == 'stop')
		return 'stop';

	var angle = '0';

	if (robotState == 'down')
		angle = 180;
	else if (robotState == 'left')
		angle = 270;
	else if (robotState == 'right')
		angle = 90;

	return angle;
}

function getInfo(usersConnected) {
	var info = usersConnected == 1 ? ' user online' : ' users online';
	return info;
}

function getUserPositionByID(userID) {
	usernames.forEach(function(index, item) {
		if (item.id == userID) return index;
	});

	return -1;
}

function getUsernameByID(userID) {
	usernames.forEach(function(item) {
		if (item.id == userID) return item.user;
	});

	return -1;
}
