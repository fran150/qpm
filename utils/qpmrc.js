var Q = require('Q');
var fs = require('fs');
var merge = require('merge');

var qpmRcExceptions = require('../exceptions/qpmrc.exceptions');

var logger = require("./logger");

function getDefaultConfig() {
    return {
        server: "http://localhost:3000"
    }
}

var savedConfig;

function Qpmrc() {
    var self = this;

    this.read = function(spaces) {        
        return Q.Promise(function(resolve, reject) {
            if (savedConfig) {
                resolve(savedConfig);
            } else {
                var rcFile = {};
            
                var target = "./.qpmrc";
    
                logger.debug("Reading .qpmrc file", spaces);
        
                fs.readFile(target, 'utf8', function(err, fileContent) {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            var config = getDefaultConfig();
    
                            logger.debug(".qpmrc file not found using default config", spaces);
                            logger.verbose(JSON.stringify(config));

                            savedConfig = config;                            
                            resolve(config);
                        } else {   
                            var ex = new qpmRcExceptions.CantReadQpmRcFileException(err);
                            logger.error(ex.message);
                            reject(ex);
                        }
                    } else {
                        logger.debug(".qpmrc file found using for configuration", spaces);

                        rcFile = JSON.parse(fileContent);
        
                        var config = merge.recursive(getDefaultConfig(), rcFile);

                        logger.verbose(JSON.stringify(config));
            
                        savedConfig = config;
                        resolve(config);
                    }
                });                    
            }
        });
    }
}

module.exports = new Qpmrc();