var Q = require('Q');
var merge = require('merge');
var request = require('request');
const chalk = require('chalk');

var qpmrc = require('./qpmrc');
var args = require('./arguments');

module.exports = {
    // Get the specified package config from service
    getPackage: function(name, version, spaces) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";

            qpmrc.read(args.isDebug(), args.isVerbose(), spaces).then(function(config) {
                var reqConfig = {
                    url: config.server + '/package/' + name + '/' + version,
                    json: true
                }
        
                // Merge with default options
                reqConfig = merge.recursive(reqConfig, config.http);
    
                if (args.isDebug()) {
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
            .catch(function (error) {
                console.log(chalk.red("Error reading .qpmrc file"));
                reject(error)
            });
        });
    },

    // Get the specified package config from service
    getPackages: function(packages, spaces) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";

            qpmrc.read(args.isDebug(), args.isVerbose(), spaces).then(function(config) {
                var reqConfig = {
                    url: config.server + '/package',
                    json: true,
                    body: packages
                }
        
                // Merge with default options
                reqConfig = merge.recursive(reqConfig, config.http);
            
                request.post(reqConfig, function(error, response, body) {
                    if (!error) {
                        resolve(body);
                    } else {
                        console.log(error);
                        reject(new Error(error));
                    }                
                });    
            })
            .catch(function (error) {
                console.log(chalk.red("Error reading .qpmrc file"));
                reject(error)
            });
        });
    }
}
