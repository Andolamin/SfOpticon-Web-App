/**
 * Created by Alan on 5/18/2014.
 */
var HashMap = require('hashmap').HashMap;
var mysql = require('mysql');

var parameters = {
    name: {
        required: true,
        type: 'string',
        description: 'The friendly name for the organization.'
    },
    location: {
        required: true,
        type: 'string',
        description: 'The login url (e.g. login.salesforce.com).'
    },
    production: {
        required: true,
        default: false,
        type: 'boolean',
        description: 'Flag for if this org is production. Will be ignored if a production org is already set up.'
    },
    username: {
        required: false,
        dependency: 'userSecurityToken',
        type: 'string',
        description: 'The current user\'s username for this organization.'
    },
    password: {
        required: false,
        dependency: 'userSecurityToken',
        type: 'string',
        description: 'The current user\'s password for this organization.'
    },
    token: {
        required: false,
        dependency: 'userSecurityToken',
        type: 'string',
        description: 'The current user\'s security token for this organization.'
    },
    userAuthId: {
        required: false,
        type: 'string',
        description: 'The current user\'s production username.'
    },
    userSecurityToken: {
        required: false,
        type: 'string',
        description: 'The current user\'s production security token. Used for security storing organization credentials.'
    }
};

function handleCommand(socket, args) {
    console.log('(' + socket.key + '): Creating environment from command: ' + args);
    // socket.write('INFO: Creating environment from command: ' + args + '\r\n');

    var params = require('../libs/parameterHelper.js').parametersFromArguments(args.slice(2));
    var passesValidation = require('../libs/parameterHelper.js').argumentsValid(params, parameters);

    console.log('(' + socket.key + '): Arguments are ' + (passesValidation ? 'valid' : 'invalid'));
    if (!passesValidation) {
        var documentation = require('../libs/parameterHelper.js').argumentDocumentation(parameters);
        socket.write('environment create ' + documentation[0] + '\r\n');
        for (var i = 1; i < documentation.length; i++) {
            socket.write(documentation[i] + '\r\n');
        }
        socket.write('ERROR: Arguments were invalid. See the returned documentation for command structure.\r\n');
        socket.destroy();
        return;
    }
    var settings = require('../settings.js');
    var connection = mysql.createConnection({
        host     : settings.mysqlHost,
        user     : settings.mysqlUsername,
        password : settings.mysqlPassword
    });
    connection.connect();

    socket.write('SUCCESS: Job started successfully');
    socket.destroy();

};
exports.handleCommand = handleCommand;