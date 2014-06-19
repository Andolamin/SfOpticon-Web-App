/**
 * Created by Alan on 6/11/2014.
 */
var mysql = require('mysql');
var schedule = require('node-schedule');

function CommandController() {
    this.paramDefinition = {
        schedule: {
            required: false,
            type: 'datetime',
            description: 'The scheduled date/time to run'
        },
        gitUsername: {
            required: true,
            type: 'string',
            description: 'Github Username'
        },
        gitPassword: {
            required: true,
            type: 'string',
            description: 'Github password'
        },
        gitFullName: {
            required: true,
            type: 'string',
            description: 'Git Fullname'
        },
        gitEmail: {
            required: true,
            type: 'string',
            description: 'Git Email'
        }
    };
    this.progressDef = [];
    this.lastProgress = -1;
    this.socket = null;
    this.params = null;
    this.connection = null;
    this.jobId = null;
    this.commandType = '';
    this.args = null;
}

CommandController.prototype.handleCommand = function handleCommand(socket, args) {
    this.socket = socket;
    this.args = args;
    this.params = require('../libs/parameterHelper.js').parametersFromArguments(args.slice(2));
    console.log('(' + this.socket.key + '): Executing command: ' + this.params);

    // Create job record in DB
    var settings = require('../../settings.js');
    this.connection = mysql.createConnection({
        host     : settings.mysqlHost,
        user     : settings.mysqlUsername,
        password : settings.mysqlPassword
    });
    this.connection.connect();
    this.connection.query('USE ' + settings.mysqlDB);
    this.connection.query("INSERT INTO `Job` (`Status`, `Progress`, `ReceivedTime`, `Type`) VALUES ('Received', '0.00', NOW(6), '" + this.commandType + "');",
        function (err, result) {
            if (err) {
                console.log('(' + this.socket.key + '): MySQL error: ' + err.message);
                this.socket.write('ERROR: Error starting job');
//                this.socket.destroy();
                this.connection.end();
            } else {
                this.jobId = result.insertId;
                this.startOrScheduleJob();
            }
        }.bind(this));
};

CommandController.prototype.startOrScheduleJob = function startOrScheduleJob() {
    console.log('(' + this.socket.key + '): Job ID: ' + this.jobId);
    this.connection.query("INSERT INTO `JobLog` (`JobID`, `Value`, `Time`) VALUE (" + this.jobId + ", 'Received', NOW(6))",
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
        this.socket.write('ERROR: Arguments were invalid. See the returned documentation for command structure.\n');

        // Update job record with error
        this.connection.query("INSERT INTO `JobLog` (`JobID`, `Value`, `Time`) VALUE (" + this.jobId + ", 'Invalid Parameters', NOW(6));");
        this.connection.query("UPDATE `Job` SET `Progress` = 100, `Status` = 'Failed: Invalid Parameters' WHERE `ID` = " + this.jobId);
        this.connection.end();
    } else {
        this.socket.write('SUCCESS: Job received successfully: ' + this.jobId + '\n');
    }

    if (typeof this.params.get('schedule') == 'undefined') {
        this.handleJob();
    } else {
        // Schedule the job
        this.connection.query("INSERT INTO `CronTable` (`ScheduleTime`, `Parameters`, `JobID`) VALUES (?, ?, ?)",
            [this.params.get('schedule'), JSON.stringify(this.args), this.jobId],
            function() {
                schedule.scheduleJob(new Date(Date.parse(this.params.get('schedule'))), function (inJobId) {
                    return function () {
                        var ScheduledExecutionHelper = require('../libs/scheduledExecutionHelper.js');
                        new ScheduledExecutionHelper().execute(inJobId);
                    }
                }(this.jobId));
            }.bind(this));

        this.connection.query("INSERT INTO `JobLog` (`JobID`, `Value`, `Time`) VALUE (" + this.jobId + ", 'Scheduled', NOW(6));");
        this.connection.query("UPDATE `Job` SET `Progress` = 0, `Status` = 'Scheduled' WHERE `ID` = " + this.jobId);
    }
};

CommandController.prototype.handleJob = function handleJob() {
    // Abstract - should be overridden in child.
};

CommandController.prototype.handleSfOpticonData = function handleSfOpticonData(data) {
    var lines = data.toString().split('\n');
    for (var i = 0; i < lines.length; i++) {
        var progress = this.lastProgress + 1;
        while (progress < this.progressDef.length) {
            // console.log('Checking "' + lines[i] + '" for "' + this.progressDef[progress].trigger + '"');
            if (lines[i].indexOf(this.progressDef[progress].trigger) != -1) {
                // console.log('Found trigger');
                // Found our trigger
                this.connection.query("INSERT INTO `JobLog` (`JobID`, `Value`, `Time`) VALUE (" + this.jobId + ", '" + this.progressDef[progress].message + "', NOW(6));");
                this.connection.query("UPDATE `Job` SET `Progress` = " + this.progressDef[progress].progress + ", `Status` = '" + this.progressDef[progress].message + "' WHERE `ID` = " + this.jobId);
                if (this.progressDef[progress].message == 'Started') {
                    this.connection.query("UPDATE `Job` SET `StartTime` = NOW(6) WHERE `ID` = " + this.jobId);
                }
                this.lastProgress = progress;
                // console.log('New progress: ' + this.lastProgress);
                break;
            } else if (this.progressDef[progress].always == true) {
                // Can't continue until we satisfy this trigger
                break;
            }
            // Didn't satisfy the trigger but it wasn't required, so skip it
            progress++;
        }
    }
};

module.exports = CommandController;