/**
 * Delete an environment in SfOpticon and the service database
 *
 * Created by Alan on 5/27/2014.
 */
var GitHubApi = require("github");
var CommandController = require('./commandController.js');
var merge = require('merge');

function DeleteEnvironmentController() {
    CommandController.apply(this, Array.prototype.slice.call(arguments));
    this.paramDefinition = merge(this.paramDefinition, {
        name: {
            required: true,
            type: 'string',
            description: 'The organization to delete'
        },
        gitUsername: {
            required: true,
            type: 'string',
            description: 'Your github username'
        },
        gitPassword: {
            required: true,
            type: 'string',
            description: 'Your github password'
        },
        production: {
            required: false,
            type: 'boolean',
            default: false,
            description: 'Whether the intended org is the production org'
        }
    });

    this.progressDef = [
        {
            trigger: 'Warning!',
            progress: 5,
            message: 'Started',
            always: true
        },
        {
            trigger: 'NOTICE!',
            progress: 25,
            message: 'Deleting test environments',
            always: false
        },
        {
            trigger: 'Deleting',
            progress: 75,
            message: 'Deleting environment',
            always: true
        }
    ];
    this.commandType = 'Delete Environment';
};

DeleteEnvironmentController.prototype = new CommandController();

DeleteEnvironmentController.prototype.handleJob = function handleJob() {
    // Process the job
    var spawn = require('child_process').spawn;
    var sfArgs = [
        'bin/environment.rb',
        'delete',
        '--org',
        this.params.get('name'),
        '--force',
        'true'
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
        // console.log('stdout: ' + data);
    }.bind(this));
    child.stderr.on('data', function(data) {
        this.handleSfOpticonData(data);
        // console.log('stderr: ' + data);
    }.bind(this));

    child.on('exit', function() {
        if (this.lastProgress < this.progressDef.length - 1) {
            this.connection.query("INSERT INTO `JobLog` (`JobID`, `Value`, `Time`) VALUE (" + this.jobId + ", 'Job Failed', NOW(6));");
            this.connection.query("UPDATE `Job` SET `Progress` = 100.00, `Status` = 'Failed: Job Failed' WHERE `ID` = " + this.jobId);
        } else {
            this.connection.query('SET FOREIGN_KEY_CHECKS = 0;');
            this.connection.query("DELETE FROM `Environment` WHERE " + (this.params.get('production') == 'true' ? "1" : "`Name` = '" + this.params.get('name') + "'"));
            this.connection.query('SET FOREIGN_KEY_CHECKS = 1;');
            if (this.params.get('production') == 'true') {
                // Use the GitHub API to delete the repository if the org is production
                // TODO: Handle if someone tries to delete a repository that is owned by another account or organization
                var github = new GitHubApi({
                    // required
                    version: "3.0.0",
                    // optional
                    protocol: "https"
                });
                github.authenticate({
                    type: "basic",
                    username: this.params.get('gitUsername'),
                    password: this.params.get('gitPassword')
                });
                var settings = require('../../settings.js');

                github.repos.delete({
                    'user': (settings.githubOrganization != '' ? settings.githubOrganization : this.params.get('gitUsername')),
                    'repo': this.params.get('name')
                }, function(err) {
                    console.log(err);
                });
            }
            this.connection.query("UPDATE `Job` SET `Progress` = 100.00, `Status` = 'Complete' WHERE `ID` = " + this.jobId);
        }
    }.bind(this));
};

module.exports = DeleteEnvironmentController;