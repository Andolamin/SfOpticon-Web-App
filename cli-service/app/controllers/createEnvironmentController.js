/**
 * Create a new environment in SfOpticon and the service database
 *
 * Created by Alan on 5/27/2014.
 */
var HashMap = require('hashmap').HashMap;
var mysql = require('mysql');

function CreateEnvironmentController() {
    this.paramDefinition = {
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
    this.socket = null;
    this.params = null;
    this.connection = null;
    this.jobId = null;
}

CreateEnvironmentController.prototype.handleCommand = function handleCommand(socket, args) {
    this.socket = socket;
    this.params = require('../libs/parameterHelper.js').parametersFromArguments(args.slice(2));
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
    this.connection.query("INSERT INTO `job` (`status`, `progress`, `start`, `type`) VALUES ('Received', '0.00', NOW(), 'Create Environment');",
        function (err, result) {
            if (err) {
                console.log('(' + this.socket.key + '): MySQL error: ' + err.message);
                this.socket.write('ERROR: Error starting job');
                this.socket.destroy();
                this.connection.end();
            } else {
                this.jobId = result.insertId;
                this.startOrScheduleJob();
            }
        }.bind(this));
};

CreateEnvironmentController.prototype.startOrScheduleJob = function startOrScheduleJob() {
//    this.socket.write('Job ID: ' + this.jobId + '\r\n');
//    this.socket.destroy();
    console.log('(' + this.socket.key + '): Job ID: ' + this.jobId + '\r\n');
    this.connection.query("INSERT INTO `jobLog` (`jobID`, `text`, `time`) VALUE (" + this.jobId + ", 'Received', NOW())",
        function(err) {
            if (err) {
                console.log('(' + this.socket.key + '): Error inserting log');
            }
        });
    // Verify that the parameters satisfy the definition
    var passesValidation = require('../libs/parameterHelper.js').argumentsValid(this.params, this.paramDefinition);

    console.log('(' + this.socket.key + '): Arguments are ' + (passesValidation ? 'valid' : 'invalid'));
    if (!passesValidation) {
        // Parameters don't satisfy the definition. Output them and exit.
        var documentation = require('../libs/parameterHelper.js').argumentDocumentation(this.paramDefinition);
        this.socket.write('create environment ' + documentation[0] + '\r\n');
        for (var i = 1; i < documentation.length; i++) {
            this.socket.write(documentation[i] + '\r\n');
        }
        this.socket.write('ERROR: Arguments were invalid. See the returned documentation for command structure.\r\n');
        this.socket.destroy();

        // Update job record with error
        this.connection.query("INSERT INTO `jobLog` (`jobID`, `text`, `time`) VALUE (" + this.jobId + ", 'Invalid Parameters', NOW());");
        this.connection.query("UPDATE `job` SET `progress` = 100.0, `status` = 'Failed: Invalid Parameters'");
        this.connection.end();
    } else {
        this.socket.write('SUCCESS: Job received successfully');
        this.socket.destroy();

        // TODO: Process the job
        /*
        var exec = require('child_process').exec;
        var child = exec('dir', function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
        */
    }
}


module.exports = CreateEnvironmentController;