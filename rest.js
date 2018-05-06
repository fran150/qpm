var Q = require('Q');
var merge = require('merge');
var request = require('request');
const chalk = require('chalk');

var qpmrc = require('./qpmrc');

module.exports = {
    // Get the specified package config from service
    getPackage: function(name, version, spaces, debug) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";

            qpmrc.read().then(function(config) {
                var reqConfig = {
                    url: config.server + '/package/' + name + '/' + version,
                    json: true
                }
        
                // Merge with default options
                reqConfig = merge.recursive(reqConfig, config.http);
    
                if (debug) {
                    console.log(spaces + chalk.yellow("Searching quark config for package " + chalk.white(name + "#" + version)));
                }
        
                request.get(reqConfig, function(error, response, body) {
                    if (!error) {
                        resolve(body);
                    } else {
                        console.log(error);
                        reject(new Error(error));
                    }                
                });    
            })    
        });
    }
}
