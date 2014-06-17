/**
 * Merge two environments (i.e. deploy from one org to another)
 *
 * Created by Alan on 5/27/2014.
 */
var CommandController = require('./commandController.js');
var merge = require('merge');

function MergeEnvironmentsController() {
    CommandController.apply(this, Array.prototype.slice.call(arguments));
    this.paramDefinition = merge(this.paramDefinition, {
        origin: {
            required: true,
            type: 'string',
            description: 'The organization to scan'
        },
        originUsername: {
            required: true,
            type: 'string',
            description: 'User\'s username for accessing the origin org'
        },
        originPassword: {
            required: true,
            type: 'string',
            description: 'User\'s password for accessing the origin org'
        },
        originToken: {
            required: true,
            type: 'string',
            description: 'User\'s security token for accessing the origin org'
        },
        target: {
            required: true,
            type: 'string',
            description: 'The organization to scan'
        },
        targetUsername: {
            required: true,
            type: 'string',
            description: 'User\'s username for accessing the origin org'
        },
        targetPassword: {
            required: true,
            type: 'string',
            description: 'User\'s password for accessing the origin org'
        },
        targetToken: {
            required: true,
            type: 'string',
            description: 'User\'s security token for accessing the origin org'
        }
    });

    this.progressDef = [
        {
            trigger: "Init'ing local repository",
            progress: 5,
            message: 'Started',
            always: true
        },
        {
            trigger: "latest from remote",
            progress: 10,
            message: 'Rebasing',
            always: true
        },
        {
            trigger: 'Rebase complete',
            progress: 25,
            message: 'Rebase complete',
            always: false
        },
        {
            trigger: 'Complete',
            progress: 25,
            message: 'Rebase complete',
            always: false
        },
        {
            trigger: 'Merging branch',
            progress: 30,
            message: 'Merging',
            always: true
        },
        {
            trigger: 'Already up-to-date',
            progress: 35,
            message: 'No changes detected',
            always: false
        },
        {
            trigger: 'Deleting all sfobjects',
            progress: 50,
            message: 'Cleaning up',
            always: true
        },
        {
            trigger: 'Gathering',
            progress: 60,
            message: 'Scanning',
            always: true
        },
        {
            trigger: 'Deleting',
            progress: 100,
            message: 'Complete',
            always: true
        }
    ];

    this.commandType = 'Merge Environment';
};

MergeEnvironmentsController.prototype = new CommandController();

MergeEnvironmentsController.prototype.handleJob = function handleJob() {
    // Set up git and github
    var ConfigurationHelper = require('../libs/configHelper.js');
    new ConfigurationHelper().setGitConfig(this.params.get('gitFullName'), this.params.get('gitEmail'));
    new ConfigurationHelper().setGithubCredentials(this.params.get('gitUsername'), this.params.get('gitPassword'));

    // Set up org credentials
    var CredentialsHelper = require('../libs/credentialsHelper.js');
    new CredentialsHelper().setCredentials(this.params.get('origin'), this.params.get('originUsername'), this.params.get('originPassword'), this.params.get('originToken'));
    new CredentialsHelper().setCredentials(this.params.get('target'), this.params.get('targetUsername'), this.params.get('targetPassword'), this.params.get('targetToken'));

    // Attach the job to the orgs
    this.connection.query("INSERT INTO `EnvironmentJob` (`EnvironmentID`, `JobID`) VALUES ((SELECT `ID` FROM `Environment` WHERE `Name` = '" + this.params.get('origin') + "'), " + this.jobId + ")");
    this.connection.query("INSERT INTO `EnvironmentJob` (`EnvironmentID`, `JobID`) VALUES ((SELECT `ID` FROM `Environment` WHERE `Name` = '" + this.params.get('target') + "'), " + this.jobId + ")");

    // Process the job
    var spawn = require('child_process').spawn;
    var sfArgs = [
        'bin/integrate.rb',
        'merge',
        '--source',
        this.params.get('origin'),
        '--destination',
        this.params.get('target')
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

        // Clean up orgs' credentials from SfOpticon's unencrypted database
        var CredentialsHelper = require('../libs/credentialsHelper.js');
        new CredentialsHelper().cleanupEnvironment(this.params.get('origin'));
        new CredentialsHelper().cleanupEnvironment(this.params.get('target'));

        // Clean up git settings from unencrypted storage
        new ConfigurationHelper().clearGitConfig();
        new ConfigurationHelper().clearGithubCredentials();
    }.bind(this));
};

module.exports = MergeEnvironmentsController;