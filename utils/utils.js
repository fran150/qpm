const fs = require('fs');
var Q = require('Q');

function Utils() {
    var self = this;

    this.fileExists = function(fileName) {
        return Q.Promise(function(resolve, reject) {
            fs.stat(fileName, function(err) {                
                if(err == null) {
                    resolve(true);
                } else if(err.code === 'ENOENT') {
                    resolve(false);
                } else {
                    reject(err);
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

    this.modsToArray = function(mods) {
        var result = {};

        for (var name in mods) {
            result[name] = mods[name].version;
        }

        return result;
    }
}

module.exports = new Utils();