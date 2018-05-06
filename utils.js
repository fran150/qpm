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
        return $.isArray(variable);
    };

    // Check if the specified var is an object
    this.isObject = function (variable) {
        if (variable !== null && typeof variable === 'object' && !(variable instanceof Array)) {
            return true;
        }

        return false;
    };
    
}

module.exports = new Utils();