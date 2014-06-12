/**
 * Created by Alan on 6/9/2014.
 */
var mysql = require('mysql');

function CredentialsHelper() {}

CredentialsHelper.prototype.connectDB = function connectDB() {
    var settings = require('../settings.js');
    this.connection = mysql.createConnection({
        host     : settings.mysqlHost,
        user     : settings.mysqlUsername,
        password : settings.mysqlPassword
    });
    this.connection.connect();
    this.connection.query('USE ' + settings.serviceDB);
}

CredentialsHelper.prototype.setCredentials = function setCredentials(inEnvironmentName, inUsername, inPassword, inToken) {
    this.connectDB();
    this.connection.query("UPDATE `environments` SET " +
                          "`username`='" + inUsername + "', " +
                          "`password`='" + inPassword + "', " +
                          "`securitytoken`='" + inToken + "' " +
                          "WHERE `Name` = '" + inEnvironmentName + "'");
    this.connection.end();
};

CredentialsHelper.prototype.cleanupEnvironment = function cleanupEnvironment(inEnvironmentName) {
    this.connectDB();
    this.connection.query("UPDATE `environments` SET " +
                          "`username`='', " +
                          "`password`='', " +
                          "`securitytoken`='' " +
                          "WHERE `Name` = '" + inEnvironmentName + "'");
    this.connection.end();
};

CredentialsHelper.prototype.cleanupAll = function cleanupAll() {
    this.connectDB();
    this.connection.query("UPDATE `environments` SET " +
                          "`username`='', " +
                          "`password`='', " +
                          "`securitytoken`='' " +
                          "WHERE 1");
    this.connection.end();
};

module.exports = CredentialsHelper;