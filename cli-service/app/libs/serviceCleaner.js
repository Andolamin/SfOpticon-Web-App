/**
 * Created by Alan on 6/9/2014.
 */
var mysql = require('mysql');

function ServiceCleaner() {
    var settings = require('../settings.js');
    this.connection = mysql.createConnection({
        host     : settings.mysqlHost,
        user     : settings.mysqlUsername,
        password : settings.mysqlPassword
    });
    this.connection.connect();
    this.connection.query('USE ' + settings.serviceDB);
}

ServiceCleaner.prototype.cleanupEnvironment = function cleanupEnvironment(inEnvironmentName) {
    this.connection.query("UPDATE `environments` SET `username`='', `password`='', `securitytoken`='' WHERE `Name` = '" + inEnvironmentName + "'");
};

ServiceCleaner.prototype.cleanup = function cleanup() {
    this.connection.query("UPDATE `environments` SET `username`='', `password`='', `securitytoken`='' WHERE 1");
};

module.exports = ServiceCleaner;