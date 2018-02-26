var merge = require('merge');
var request = require('request');
const chalk = require('chalk');
var qpmrc = require('./qpmrc');

module.exports = {
    // Get the specified package config from service
    getPackage: function(name, version, spaces, debug, callback) {
        spaces = spaces || "";

        var config = qpmrc.read();

        var reqConfig = {
            url: config.server + '/package/' + name + '/' + version,
            json: true
        }

        // Merge with default options
        reqConfig = merge.recursive(reqConfig, config.http);

        request.get(reqConfig, function(error, response, body) {
            callback(body);
        });
    }
}
