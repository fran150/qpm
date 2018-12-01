var Q = require('Q');
var merge = require('merge');
var request = require('request');
var chalk = require('chalk');

var restExceptions = require('../exceptions/restService.exceptions');

var qpmrc = require('./qpmrc');
var logger = require('./logger');

function processResponse(error, response, body, resolve, reject) {
    if (!error && response.statusCode >= 200 && response.statusCode < 300) {
        resolve(body);
    } else {
        var ex;

        if (error) {
            ex = new restExceptions.ErrorCallingServerException(error);
        } else if (response.statusCode == 401 || response.statusCode == 403) {
            ex = new restExceptions.UnauthorizedException(response, body);
        } else {
            ex = new restExceptions.ServerRespondedWithErrorException(response, body);            
        }
        
        logger.error(ex.message);
        reject(ex);
    }
}

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
                    processResponse(error, response, body, resolve, reject);
                });    
            })
            .catch(reject);
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
                    processResponse(error, response, body, resolve, reject);                    
                });    
            })
            .catch(reject);
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
                    processResponse(error, response, body, resolve, reject);
                });    
            })
            .catch(reject);
        });
    }
    
}
