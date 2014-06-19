/**
 * Created by Alan on 6/16/2014.
 */
var fs = require('fs');

function ConfigurationHelper() {};

ConfigurationHelper.prototype.setGithubCredentials = function setGithubCredentials(inUsername, inPassword) {
    var settings = require('../../settings.js');
    fs.readFile(settings.sfOpticonRoot + 'application.yml', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(/url: (.*?)\n  username: (.*)\n  password: (.*)\n  local_path:/g, 'url: $1\n  username: ' + inUsername + '\n  password: ' + inPassword + '\n  local_path:');

        fs.writeFile(settings.sfOpticonRoot + 'application.yml', result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
};

ConfigurationHelper.prototype.clearGithubCredentials = function clearGithubCredenials() {
    this.setGithubCredentials('', '');
};

ConfigurationHelper.prototype.setGitConfig = function setGitConfig(inFullName, inEmail) {
    var spawn = require('child_process').spawn;
    spawn('git',
        [
            'config',
            '--global',
            'user.name',
            inFullName
        ],
        {
            cwd: '/'
        }
    );
    spawn('git',
        [
            'config',
            '--global',
            'user.email',
            inEmail
        ],
        {
            cwd: '/'
        }
    );
};

ConfigurationHelper.prototype.clearGitConfig = function clearGitConfig() {
    this.setGitConfig('', '');
};


module.exports = ConfigurationHelper;