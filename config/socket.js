var PythonShell = require('python-shell');

var pythonOptions = {
    mode: 'text',
    pythonPath: '/usr/bin/python',
    scriptPath: '/home/pi/Robot4x4Raspberry/'
};

var usersConnected = 0;
var usernamesOnline = [];
var robotState = 'stop';


module.exports = function(socket) {

    var robot = iniController();

    socket.on('connection', function(user) {

        user.on('username', function(data) {
            user.username = data;

            var res = newUser(user);

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


// Initialize the controller of the robot
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

// Adds a new user online
function newUser(user, data) {
    usersConnected++;

    usernamesOnline.push(user.username);

    console.log('[SOCKET] User connected: ' + user.username + '\n');

    var info = getInfo(usersConnected);
    var angle = getAngle(robotState);

    return {
        info: info,
        angle: angle,
        usernames: usernamesOnline
    }
}

// Remove a user online because of the disconnection of a socket
function removeUser(user) {
    usersConnected--;

    usernamesOnline.splice(usernamesOnline.indexOf(user.username), 1);

    console.log('[SOCKET] User disconnected: ' + user.username + '\n');

    var info = getInfo(usersConnected);

    return {
        info: info,
        usernames: usernamesOnline
    }
}

// Gets the degree associated with the order
function getAngle(robotState) {
    if (robotState == 'stop')
        return 'stop';

    var angle = 0;

    if (robotState == 'down')
        angle = 180;
    else if (robotState == 'left')
        angle = 270;
    else if (robotState == 'right')
        angle = 90;

    return angle;
}

// Creates the string to inform the quantity of users online
function getInfo(usersConnected) {
    var info = usersConnected == 1 ? ' user online' : ' users online';
    return info;
}
