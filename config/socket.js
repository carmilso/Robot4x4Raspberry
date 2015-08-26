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
			var res = newUser(user, data);

			user.emit('actualState', res.angle);

			socket.emit('usersConnected', {usersInt: usersConnected+res.info, usersVector: res.usernames});
		});

		user.on('arrow', function(state) {
			var aState = getAngle(state);
			robot.send(state+'\n');
			socket.emit('actualState', aState);
		});

		user.on('disconnect', function() {
			var res = removeUser(user);

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

function newUser(user, data) {
	usersConnected++;

	usernames.push({ id: user.id, user: data });

	console.log('[SOCKET] User connected: ' + data + '\n');

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

function removeUser(user) {
	usersConnected--;

	console.log('[SOCKET] User disconnected: ' + getUsernameByID(user.id) + '\n');

	console.log(getUserPositionByID(user.id));

	usernames.slice(getUserPositionByID(user.id), 1);

	usernames.forEach(function(item) {
		console.log(item.id + ' ' + item.user);
	});

	var info = getInfo(usersConnected);

	var usernamesOnline = [];
	usernames.forEach(function(item) {
		console.log(item.user);
		usernamesOnline.push(item.user);
	});

	return {
		info: info,
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
	var res = -1;

	usernames.forEach(function(item, index) {
		if (item.id == userID) res = index;
	});

	return res;
}

function getUsernameByID(userID) {
	var res = -1;

	usernames.forEach(function(item) {
		if (item.id == userID) res = item.user;
	});

	return res;
}
