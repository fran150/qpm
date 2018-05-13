const fs = require('fs');
var Q = require('Q');

function Utils() {
    var self = this;

    this.fileExists = function(fileName) {
        return Q.Promise(function(resolve) {
            fs.stat(fileName, function(err, stats) {                
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }                
            })
        });
    }
    
    // Check if the specified var is an array
    this.isArray = function (variable) {
        return Array.isArray(variable);
    };

    // Check if the specified var is an object
    this.isObject = function (variable) {
        if (variable !== null && typeof variable === 'object' && !(variable instanceof Array)) {
            return true;
        }

        return false;
    };

    this.markAutoBundled = function(package, config) {
        if (!self.isArray(config.autoBundled)) {
            config.autoBundled = [package];
        } else {
            config.autoBundled.push(package);
        }

        return config;
    }

    this.unmarkAutoBundled = function(package, config) {
        if (self.isArray(config.autoBundled)) {
            for (var i = 0; i < config.autoBundled.length; i++) {
                if (config.autoBundled[i] == package) {
                    config.autoBundled.splice(i, 1);
                    return config;
                }
            }
        }

        return config;
    }
    
    this.isAutoBundled = function(package, config) {
        if (self.isArray(config.autoBundled)) {
            for (var i = 0; i < config.autoBundled.length; i++) {
                if (config.autoBundled[i] == package) {
                    return true;
                }
            }
        }

        return false;
    }
    
}

module.exports = new Utils();