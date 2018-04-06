var Q = require('Q');
var fs = require('fs');
var merge = require('merge');

function getDefaultConfig() {
    return {
        server: "http://localhost:3000"
    }
}

module.exports = {
    read: function() {
        return Q.Promise(function(resolve, reject) {
            var rcFile = {};

            var target = "./.qpmrc";
    
            fs.exists(target, function(exists) {
                if (exists) {
                    fs.readFile(target, 'utf8', function(err, fileContent) {        
                        if (err) {
                            reject(new Error(err));
                        } else {
                            rcFile = JSON.parse(fileContent);
            
                            var config = merge.recursive(getDefaultConfig(), rcFile);
                
                            resolve(config);    
                        }
                    });
                } else {
                    resolve(getDefaultConfig());
                }
            });    
        });
    }
}
