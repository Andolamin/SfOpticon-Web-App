/**
 * Created by Alan on 6/9/2014.
 */
var CommandController = require('./commandController.js');
var merge = require('merge');

function ScanEnvironmentController() {
    CommandController.apply(this, Array.prototype.slice.call(arguments));
    this.paramDefinition = merge(this.paramDefinition, {
        name: {
            required: true,
            type: 'string',
            description: 'The organization to scan'
        },
        username: {
            required: true,
            type: 'string',
            description: 'User\'s username for accessing the org'
        },
        password: {
            required: true,
            type: 'string',
            description: 'User\'s password for accessing the org'
        },
        token: {
            required: true,
            type: 'string',
            description: 'User\'s security token for accessing the org'
        }
    });

    this.progressDef = [
        {
            trigger: 'Host configured to',
            progress: 5,
            message: 'Started',
            always: true
        },
        {
            trigger: 'Gathering',
            progress: 10,
            message: 'Scanning for changes',
            always: true
        },
        {
            trigger: 'Modification detected',
            progress: 40,
            message: 'Committing changes',
            always: false
        },
        {
            trigger: 'Applying',
            progress: 40,
            message: 'Pushing changes',
            always: false
        },
        {
            trigger: 'No changes detected',
            progress: 100,
            message: 'Complete',
            always: false
        },
        {
            trigger: 'Complete',
            progress: 100,
            message: 'Complete',
            always: false
        }
    ];
    this.commandType = 'Scan Environment';
};

ScanEnvironmentController.prototype = new CommandController();

ScanEnvironmentController.prototype.handleJob = function handleJob() {
    // Set up git and github
    var ConfigurationHelper = require('../libs/configHelper.js');
    new ConfigurationHelper().setGitConfig(this.params.get('gitFullName'), this.params.get('gitEmail'));
    new ConfigurationHelper().setGithubCredentials(this.params.get('gitUsername'), this.params.get('gitPassword'));

    // Set the credentials
    var CredentialsHelper = require('../libs/credentialsHelper.js');
    new CredentialsHelper().setCredentials(this.params.get('name'), this.params.get('username'), this.params.get('password'), this.params.get('token'));

    // Attach the job to the org
    this.connection.query("INSERT INTO `EnvironmentJob` (`EnvironmentID`, `JobID`) VALUES ((SELECT `ID` FROM `Environment` WHERE `Name` = '" + this.params.get('name') + "'), " + this.jobId + ")");

    // Process the job
    var spawn = require('child_process').spawn;
    var sfArgs = [
        'bin/scanner.rb',
        'changeset',
        '--org',
        this.params.get('name')
    ];

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
        console.log(this.lastProgress);
        console.log(this.progressDef[this.lastProgress]);
        if (this.lastProgress < this.progressDef.length - 1 && this.progressDef[this.lastProgress].progress < 100) {
            this.connection.query("INSERT INTO `JobLog` (`JobID`, `Value`, `Time`) VALUE (" + this.jobId + ", 'Job Failed', NOW(6));");
            this.connection.query("UPDATE `Job` SET `Progress` = 100.00, `Status` = 'Failed: Job Failed' WHERE `ID` = " + this.jobId);
        }
        // Clean up org credentials from SfOpticon's unencrypted database
        var CredentialsHelper = require('../libs/credentialsHelper.js');
        new CredentialsHelper().cleanupEnvironment(this.params.get('name'));

        // Clean up git settings from unencrypted storage
        new ConfigurationHelper().clearGitConfig();
        new ConfigurationHelper().clearGithubCredentials();
    }.bind(this));
};

module.exports = ScanEnvironmentController;