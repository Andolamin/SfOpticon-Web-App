/**
 * Created by Alan on 5/18/2014.
 */
// Libraries
var net = require('net');
var socketController = require('./app/controllers/socketController.js');
var HashMap = require('hashmap').HashMap;
var exit = require('exit');
var errno = require('errno');

// Properties
var statusCodes = {
    normalExecution: 0,
    invalidArguments: 1,
    portOccupied: 2,
    unknownServerError: 3,
    databaseError: 4
};
var defaultPort = 43442;

// Store the arguments in a map of argument/value pairs
var arguments = new HashMap();
for (var i = 0; i < process.argv.length; i++) {
    arguments.set(process.argv[i], i);
}

// Output service documentation to console with help flag
if (arguments.has("-h") || arguments.has("--help")) {
    console.log("Command-line Interface Service for SfOpticon");
    console.log("Provides a Socket Server interface for interacting with SfOpticon on the command-line");
    console.log("");
    console.log("usage: CLIService [-p]");
    console.log("");
    console.log("       -p, --port portNumber      Specify the port to listen on (default is " + defaultPort + ")");
    console.log("");
    console.log("Relies on environment variable $SFOPTICON_ROOT to define the root directory for SfOpticon");
    console.log("");
    exit(statusCodes.normalExecution);
}

var portNumber = defaultPort;

// Handle manual port specification
if (arguments.has("-p") || arguments.has("--port")) {
    var portIndex = (arguments.get("-p") == null ? arguments.get("--port") : arguments.get("-p"));
    if ((portIndex + 1) == process.argv.length) {
        console.error("You must include a port number when using the -p flag");
        exit(statusCodes.invalidArguments);
    }
    var port = process.argv[portIndex + 1];
    if (port < 1 || port > 65535) {
        console.error("Specified port is not a valid number between 1 and 65535 (inclusive)");
        exit(statusCodes.invalidArguments);
    }
    portNumber = port;
}

// Create server
var server = net.createServer(function(c) {
    socketController.handleSocket(c);
});

// Handle server error
server.on('error', function(err) {
    // Log the error and exit the application
    console.error("Server exited with error: " + errno.code[err.code].code + ", " + errno.code[err.code].description);
    exit((err.code == 'EADDRINUSE') ? statusCodes.portOccupied : statusCodes.unknownServerError);
});

// Bind server to port
server.listen(portNumber, function() {
    console.log('Server Bound to ' + portNumber);
});