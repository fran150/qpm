const fs = require('fs');
var Q = require('Q');
var utils = require('./utils');

function BundleConfig() {
    var self = this;

    this.markAutoBundled = function(package, config) {
        if (!utils.isArray(config.autoBundled)) {
            config.autoBundled = [package];
        } else {
            config.autoBundled.push(package);
        }

        return config;
    }

    this.unmarkAutoBundled = function(package, config) {
        if (utils.isArray(config.autoBundled)) {
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
        if (utils.isArray(config.autoBundled)) {
            for (var i = 0; i < config.autoBundled.length; i++) {
                if (config.autoBundled[i] == package) {
                    return true;
                }
            }
        }

        return false;
    }
    
}

module.exports = new BundleConfig();