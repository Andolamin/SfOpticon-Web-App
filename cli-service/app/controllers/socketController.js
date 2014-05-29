/**
 * Created by Alan on 5/18/2014.
 */
// Libraries
var net = require('net');
var HashMap = require('hashmap').HashMap;

/**
 * Handle an incoming socket connection
 *
 * @param socket
 */
function handleSocket(socket) {
    // Store a key to identify the socket
    socket.key = socket.remoteAddress + ":" + socket.remotePort;
    console.log('Client (' + socket.key + ') Connected');
    // Register event listeners
    socket.on('data', handleSocketData(socket));
    socket.on('end', handleSocketEnd(socket));
    socket.on('error', handleSocketError);
    console.log('Signalling client (' + socket.key + ') to proceed')
    socket.write('Ready!\r\n');
};
exports.handleSocket = handleSocket;

/**
 * Handle incoming data on the socket stream
 *
 * @param socket
 * @returns {Function} Data handler with socket in scope
 */
function handleSocketData(socket) {
    return function(data) {
        console.log('(' + socket.key + '): Received command: ', data);
        var args = data.toString().trim().split(/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
        console.log('(' + socket.key + '): Command array: ', args);

        var controllerName = args[0] + args[1].charAt(0).toUpperCase() + args[1].slice(1) + 'Controller';
        try {
            var controller = require('./' + controllerName + '.js')
            new controller().handleCommand(socket, args);
        } catch(err) {
            console.warn(err.message);
            console.warn('(' + socket.key + '): Attempted to execute a command with no controller (' + controllerName + ')');
            socket.write('ERROR: Unable to find controller for received command (' + controllerName + ')\r\n');
            socket.destroy();
        }
    }
};


/**
 * Handle the socket closing.
 *
 * @param socket
 * @returns {Function} Close handler with socket in scope
 */
function handleSocketEnd(socket) {
    return function() {
        console.log('Socket (' + socket.key + ') Disconnected');
    };
};

function handleSocketError(err) {
    if (err.code != 'ECONNRESET' && err.code != 'EPIPE') {
        // Ignore ECONNRESET and EPIPE. Everything else (for now) should be fatal.
        console.error(err.code);
        throw err;
    }
}