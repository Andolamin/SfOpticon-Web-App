/**
 * Created by Alan on 5/18/2014.
 */
var HashMap = require('hashmap').HashMap;
var mysql = require('mysql');

// Define parameters
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
var socket = null;
var args = null;
var connection = null;
var jobId = null;

/**
 * Handle the create environment command
 *
 * @param socket
 * @param args
 */
function handleCommand(socket, args) {
    console.log(this.parameters);
    this.socket = socket;
    this.args = args;
    console.log('(' + this.socket.key + '): Creating environment from command: ' + this.args);

    // Create job record in DB
    var settings = require('../settings.js');
    this.connection = mysql.createConnection({
        host     : settings.mysqlHost,
        user     : settings.mysqlUsername,
        password : settings.mysqlPassword
    });
    this.connection.connect();
    this.connection.query('USE ' + settings.mysqlDB);
    this.connection.query("INSERT INTO `job` (`status`, `progress`, `start`, `type`) VALUES ('Received', '0.00', NOW(), 'Create Environment');", queryResultsHandler(jobInserted));
};
exports.handleCommand = handleCommand;

/**
 * Wrapper for potentially fatal query. Execution hangs while waiting for query results.
 * Will halt execution if the query fails. Otherwise will continue by calling successCallback.
 *
 * @param socket
 * @param connection
 * @param successCallback
 * @returns {Function} Scoped handler function
 */
function queryResultsHandler(successCallback) {
    return function(err, result) {
        if (err) {
            console.log('(' + this.socket.key + '): MySQL error: ' + err.message);
            this.socket.write('ERROR: MySQL error');
            this.socket.destroy();
            this.connection.end();
        } else {
            this.jobId = result.insertId;
            successCallback();
        }
    }
}

function jobInserted() {
    console.log(this.jobId);
    /*
    connection.query("INSERT INTO `jobLog` (`jobID`, `text`, `time`) VALUE (" + result.insertId + ", 'Received', NOW())",
        function(err) {
            if (err) {
                console.log('(' + socket.key + '): Error inserting log');
            }
        });
    // Verify that the parameters satisfy the definition
    var params = require('../libs/parameterHelper.js').parametersFromArguments(args.slice(2));
    var passesValidation = require('../libs/parameterHelper.js').argumentsValid(params, parameters);

    console.log('(' + socket.key + '): Arguments are ' + (passesValidation ? 'valid' : 'invalid'));
    if (!passesValidation) {
        // Parameters don't satisfy the definition. Output them and exit.
        var documentation = require('../libs/parameterHelper.js').argumentDocumentation(parameters);
        socket.write('environment create ' + documentation[0] + '\r\n');
        for (var i = 1; i < documentation.length; i++) {
            socket.write(documentation[i] + '\r\n');
        }
        socket.write('ERROR: Arguments were invalid. See the returned documentation for command structure.\r\n');
        socket.destroy();

        // Update job record with error
        connection.query("INSERT INTO `jobLog` (`jobID`, `text`, `time`) VALUE (" + result.insertId + ", 'Invalid Parameters', NOW());");
        connection.query("UPDATE `job` SET `progress` = 100.0, `status` = 'Failed: Invalid Parameters'");
    } else {
        socket.write('SUCCESS: Job received successfully');
        socket.destroy();
    }
    */
    // TODO: Schedule or Process the job
}