/**
 * Create a new environment in SfOpticon and the service database
 *
 * Created by Alan on 5/27/2014.
 */
var CommandController = require('./commandController.js');
var merge = require('merge');

function CreateEnvironmentController() {
    CommandController.apply(this, Array.prototype.slice.call(arguments));
    console.log(this.paramDefinition);
    this.paramDefinition = merge(this.paramDefinition, {
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
            dependency: 'userToken',
            type: 'string',
            description: 'The current user\'s username for this organization.'
        },
        password: {
            required: true,
            dependency: 'userToken',
            type: 'string',
            description: 'The current user\'s password for this organization.'
        },
        token: {
            required: true,
            dependency: 'userToken',
            type: 'string',
            description: 'The current user\'s security token for this organization.'
        },
        userAuthId: {
            required: true,
            type: 'string',
            description: 'The current user\'s production username.'
        },
        userToken: {
            required: true,
            type: 'string',
            description: 'The current user\'s production security token.'
        }
    });
    console.log(this.paramDefinition);

    this.progressDef = [
        {
            trigger: 'Host configured to',
            progress: 5,
            message: 'Started',
            always: true
        },
        {
            trigger: 'Creating repository',
            progress: 6,
            message: 'Creating repository',
            always: false
        },
        {
            trigger: 'Creating branch',
            progress: 10,
            message: 'Creating branch',
            always: true
        },
        {
            trigger: 'Host configured to',
            progress: 20,
            message: 'SCM set up',
            always: true
        },
        {
            trigger: 'Gathering',
            progress: 25,
            message: 'Scanning metadata',
            always: true
        },
        {
            trigger: 'Host configured to',
            progress: 50,
            message: 'Metadata scanned',
            always: false
        },
        {
            trigger: 'Retrieving',
            progress: 55,
            message: 'Fetching metadata',
            always: false
        },
        {
            trigger: 'Pushing to',
            progress: 90,
            message: 'Storing metadata',
            always: false
        },
        {
            trigger: 'Created',
            progress: 100,
            message: 'Complete',
            always: true
        }
    ];
    this.commandType = 'Create Environment';
};

CreateEnvironmentController.prototype = new CommandController();

CreateEnvironmentController.prototype.handleJob = function handleJob() {
    // Set up git and github
    console.log(this.params);
    var ConfigurationHelper = require('../libs/configHelper.js');
    new ConfigurationHelper().setGitConfig(this.params.get('gitFullName'), this.params.get('gitEmail'));
    new ConfigurationHelper().setGithubCredentials(this.params.get('gitUsername'), this.params.get('gitPassword'));

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

    var commandString = 'ruby';
    for (var i = 0; i < sfArgs.length; i++) {
        commandString += ' ' + sfArgs[i];
    }
    console.log(commandString);

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
        if (this.lastProgress < this.progressDef.length - 1) {
            this.connection.query("INSERT INTO `JobLog` (`JobID`, `Value`, `Time`) VALUE (" + this.jobId + ", 'Job Failed', NOW(6));");
            this.connection.query("UPDATE `Job` SET `Progress` = 100.00, `Status` = 'Failed: Job Failed' WHERE `ID` = " + this.jobId);
        } else {
            this.connection.query("INSERT INTO `Environment` (`Name`, `Production`, `Location`) VALUES ('" + this.params.get('name') + "', " + (this.params.has('production') ? '1' : '0') + ", '" + this.params.get('location') + "')",
                function(err, result) {
                    console.log(err);
                    var environmentId = result.insertId;
                    this.connection.query("INSERT INTO `EnvironmentJob` (`EnvironmentID`, `JobID`) VALUES (" + environmentId + ", " + this.jobId + ")")
                    // Update environment credentials
                    this.connection.query("UPDATE `EnvironmentCredential` SET `Username`='" + this.params.get('username') + "'," +
                        "`Password`=AES_ENCRYPT('" + this.params.get('password') + "', '" + this.params.get('userToken') + "'), " +
                        "`Token`=AES_ENCRYPT('" + this.params.get('token') + "', '" + this.params.get('userToken') + "') " +
                        "WHERE `EnvironmentID` = " + environmentId + " AND " +
                        "`UserID`=(SELECT `ID` FROM `User` WHERE `Username` = '" + this.params.get('userAuthId') + "' LIMIT 1)");
                }.bind(this));
        }
        // Clean up org credentials from SfOpticon's unencrypted database
        var CredentialsHelper = require('../libs/credentialsHelper.js');
        new CredentialsHelper().cleanupEnvironment(this.params.get('name'));

        // Clean up git settings from unencrypted storage
        new ConfigurationHelper().clearGitConfig();
        new ConfigurationHelper().clearGithubCredentials();
    }.bind(this));
};

module.exports = CreateEnvironmentController;