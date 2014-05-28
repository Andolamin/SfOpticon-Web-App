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
            required: true,
            dependency: 'userSecurityToken',
            type: 'string',
            description: 'The current user\'s username for this organization.'
        },
        password: {
            required: true,
            dependency: 'userSecurityToken',
            type: 'string',
            description: 'The current user\'s password for this organization.'
        },
        token: {
            required: true,
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

    this.createEnvironentProgressDef = [
        {
            trigger: 'Host configured to',
            progress: 5.00,
            message: 'Started',
            always: true
        },
        {
            trigger: 'Creating repository',
            progress: 6.00,
            message: 'Creating repository',
            always: false
        },
        {
            trigger: 'Creating branch',
            progress: 10.00,
            message: 'Creating branch',
            always: true
        },
        {
            trigger: 'Host configured to',
            progress: 20.00,
            message: 'SCM set up',
            always: true
        },
        {
            trigger: 'Gathering',
            progress: 25.00,
            message: 'Scanning metadata',
            always: true
        },
        {
            trigger: 'Host configured to',
            progress: 50.00,
            message: 'Metadata scanned',
            always: true
        },
        {
            trigger: 'Retrieving',
            progress: 55.00,
            message: 'Fetching metadata',
            always: true
        },
        {
            trigger: 'Pushing to',
            progress: 90.00,
            message: 'Storing metadata',
            always: true
        },
        {
            trigger: 'Created',
            progress: 100.00,
            message: 'Complete',
            always: true
        }
    ];
    this.lastProgress = -1;

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
    var i;
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
        for (i = 1; i < documentation.length; i++) {
            this.socket.write(documentation[i] + '\r\n');
        }
        this.socket.write('ERROR: Arguments were invalid. See the returned documentation for command structure.\r\n');
        this.socket.destroy();

        // Update job record with error
        this.connection.query("INSERT INTO `jobLog` (`jobID`, `text`, `time`) VALUE (" + this.jobId + ", 'Invalid Parameters', NOW());");
        this.connection.query("UPDATE `job` SET `progress` = 100.0, `status` = 'Failed: Invalid Parameters' WHERE `ID` = " + this.jobId);
        this.connection.end();
    } else {
        this.socket.write('SUCCESS: Job received successfully: ' + this.jobId + '\r\n');
        this.socket.destroy();

        // Process the job
        var spawn = require('child_process').spawn;
        var sfArgs = [
            'bin/environment.rb',
            'create',
            '--name',
            this.params.get('name'),
            '--host',
            this.params.get('location'),
            '--username',
            this.params.get('username'),
            '--password',
            this.params.get('password'),
            '--securitytoken',
            this.params.get('token')
        ];
        if (this.params.has('production') && this.params.get('production') == 'true') {
            sfArgs.push('--production');
        }

        var child = spawn('ruby',
            sfArgs,
            {
                cwd: '/sfopticon'
            });
        child.stdout.on('data', function(data) {
            this.handleSfOpticonData(data);
            console.log('stdout: ' + data);
        }.bind(this));
        child.stderr.on('data', function(data) {
            this.handleSfOpticonData(data);
            console.log('stderr: ' + data);
        }.bind(this));

        child.on('exit', function() {
            if (this.lastProgress < this.createEnvironentProgressDef.length - 1) {
                this.connection.query("INSERT INTO `jobLog` (`jobID`, `text`, `time`) VALUE (" + this.jobId + ", 'Job Failed', NOW());");
                this.connection.query("UPDATE `job` SET `progress` = 100.00, `status` = 'Failed: Job Failed' WHERE `ID` = " + this.jobId);
            }
        }.bind(this));
    }
};

CreateEnvironmentController.prototype.handleSfOpticonData = function handleSfOpticonData(data) {
    var progress = this.lastProgress + 1;
    if (progress >= this.createEnvironentProgressDef.length) {
        return;
    }
    while (true) {
        if (data.toString().indexOf(this.createEnvironentProgressDef[progress].trigger) != -1) {
            // Found our trigger
            this.connection.query("INSERT INTO `jobLog` (`jobID`, `text`, `time`) VALUE (" + this.jobId + ", '" + this.createEnvironentProgressDef[progress].message + "', NOW());");
            this.connection.query("UPDATE `job` SET `progress` = " + this.createEnvironentProgressDef[progress].progress + ", `status` = '" + this.createEnvironentProgressDef[progress].message + "' WHERE `ID` = " + this.jobId);
            this.lastProgress = progress;
            break;
        } else if (this.createEnvironentProgressDef[progress].always == true) {
            // Can't continue until we satisfy this trigger
            break;
        }
        // Didn't satisfy the trigger but it wasn't required, so skip it
        progress++;
    }
};

module.exports = CreateEnvironmentController;