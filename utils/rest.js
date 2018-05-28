var Q = require('Q');
var merge = require('merge');
var request = require('request');
var chalk = require('chalk');

var qpmrc = require('./qpmrc');
var logger = require('./logger');

module.exports = {
    // Get the specified package config from service
    getPackage: function(name, version, spaces) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";

            qpmrc.read(spaces).then(function(config) {
                var reqConfig = {
                    url: config.server + '/package/' + name + '/' + version,
                    json: true
                }
        
                // Merge with default options
                reqConfig = merge.recursive(reqConfig, config.http);
    
                logger.debug("Searching quark config for package " + chalk.bold.green(name + "#" + version), spaces);
                        
                request.get(reqConfig, function(error, response, body) {
                    if (!error) {
                        resolve(body);
                    } else {
                        logger.error(error);
                        reject(new Error(error));
                    }                
                });    
            })
            .catch(function (error) {
                logger.error("Error reading .qpmrc file");
                reject(error)
            });
        });
    },

    // Get the specified packages config from service
    getPackages: function(packages, spaces) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";

            qpmrc.read(spaces).then(function(config) {
                var reqConfig = {
                    url: config.server + '/package/search',
                    json: true,
                    body: packages
                }
        
                // Merge with default options
                reqConfig = merge.recursive(reqConfig, config.http);
            
                request.post(reqConfig, function(error, response, body) {
                    if (!error) {
                        resolve(body);
                    } else {
                        logger.error(error);
                        reject(new Error(error));
                    }                
                });    
            })
            .catch(function (error) {
                logger.error("Error reading .qpmrc file");
                reject(error);
            });
        });
    },

    // Get the specified packages config from service
    registerPackage: function(package, token, spaces) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";

            qpmrc.read(spaces).then(function(config) {
                var reqConfig = {
                    url: config.server + '/package',
                    json: true,
                    body: package,
                    headers: {
                        "token": token
                    }
                }
        
                // Merge with default options
                reqConfig = merge.recursive(reqConfig, config.http);
            
                request.post(reqConfig, function(error, response, body) {
                    if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                        resolve(body);
                    } else if (response.statusCode >= 400 && response.statusCode < 500) {
                        var msg = "User unauthorized to register a package. If the package exists the only users authorized to edit it are the original user that register the package first or a repo collaborator";
                        logger.error(msg);
                        reject(msg);
                    } else {
                        reject(error);
                    }
                });    
            })
            .catch(function (error) {
                logger.error("Error reading .qpmrc file");
                reject(error);
            });
        });
    }
    
}
