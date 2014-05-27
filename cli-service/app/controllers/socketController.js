/**
 * Created by Alan on 5/18/2014.
 */
// Libraries
var net = require('net');
var HashMap = require('hashmap').HashMap;

function handleSocket(socket) {
    // Store a key to identify the socket
    socket.key = socket.remoteAddress + ":" + socket.remotePort;
    console.log('Client (' + socket.key + ') Connected');
    // Register event listeners
    socket.on('data', handleSocketData(socket));
    socket.on('end', handleSocketEnd(socket));
    console.log('Signalling client (' + socket.key + ') to proceed')
    socket.write('Ready!\r\n');
};
exports.handleSocket = handleSocket;

function handleSocketData(socket) {
    return function(data) {
        console.log('(' + socket.key + '): Received command: ', data);
        var args = data.toString().trim().split(/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
        console.log('(' + socket.key + '): Command array: ', args);

        var controller = args[1] + args[0].charAt(0).toUpperCase() + args[0].slice(1) + 'Controller';
        try {
            require('./' + controller + '.js').handleCommand(socket, args);
        } catch(err) {
            console.log(err);
            console.warn('(' + socket.key + '): Attempted to execute a command with no controller (' + controller + ')');
            socket.write('ERROR: Unable to find controller for received command (' + controller + ')\r\n');
            socket.destroy();
        }
    }
};

function handleSocketEnd(socket) {
    return function() {
        console.log('Socket (' + socket.key + ') Disconnected');
    };
};