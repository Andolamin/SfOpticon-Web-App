/**
 * Created by Alan on 6/17/2014.
 */
var mysql = require('mysql');

function ScheduledExecutionHelper() {};

ScheduledExecutionHelper.prototype.execute = function execute(inJobID) {
    this.jobId = inJobID;
    var settings = require('../../settings.js');
    this.connection = mysql.createConnection({
        host     : settings.mysqlHost,
        user     : settings.mysqlUsername,
        password : settings.mysqlPassword
    });
    this.connection.connect();
    this.connection.query('USE ' + settings.mysqlDB);
    this.connection.query('SELECT `Parameters` FROM `CronTable` WHERE `JobID` = ?', [inJobID], function(err, rows, fields) {
        console.log('Running scheduled job: ' + this.jobId);
        var args = JSON.parse(rows[0]['Parameters']);
        console.log(args);
        var controllerName = args[0] + args[1].charAt(0).toUpperCase() + args[1].slice(1) + 'Controller';
        try {
            var controller = require('../controllers/' + controllerName + '.js')
            var controllerInstance = new controller();
            controllerInstance.jobId = this.jobId;
            controllerInstance.args = args;
            controllerInstance.params = require('./parameterHelper.js').parametersFromArguments(args.slice(2));
            controllerInstance.connection = this.connection;
            this.connection.query("UPDATE `CronTable` SET `Executed` = 1 WHERE `JobID` = ?", [this.jobId]);
            controllerInstance.handleJob();
        } catch(err) {
            console.warn(err.message);
            console.warn(err.stack);
            console.warn('Attempted to execute a scheduled command with no controller (' + controllerName + ')');
        }
    }.bind(this));
};

module.exports = ScheduledExecutionHelper;