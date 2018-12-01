var Q = require('q');
var chalk = require('chalk');

var requireBaseExceptions = require("../exceptions/requireBase.exceptions");

var logger = require('../utils/logger');
var qpmrc = require('../utils/qpmrc');
var utils = require('../utils/utils');

var argv = require('minimist')(process.argv.slice(2));

// Get the base dir where the app and bower_moudules high
function getRequireBaseDir(spaces, args) {
    spaces = spaces || "";

    return Q.Promise(function(resolve, reject) {
        // Base dir for application
        let baseDir = "";

        if (!args || args == null) {
            args = argv;
        }

        // Check for b option
        if (args["b"]) {
            baseDir = args["b"];
        }
        
        // Check for base parameter
        if (!baseDir && args["base"]) {
            baseDir = args["base"];
        }
        
        // If base dir not specified as argument
        if (!baseDir) {
            logger.debug("Base dir parameter not specified, checking .qpmrc file", spaces);
            
            // Search on .qpmrc
            qpmrc.read(spaces + "  ").then(function(config) {
                // If config has a base parameter then use that value if not
                // use standard base dir
                if (config && config.base) {
                    logger.debug("Base dir config found on .qpmrc", spaces);
                    
                    // Use specified in .qpmrc
                    baseDir = config.base;
                } else {
                    logger.debug("Base dir config not found on .qpmrc", spaces);
                    logger.debug("Checking standard base dir", spaces);
                    
                    // Set default
                    baseDir = "./src";
                }

                // Check if the specified base dir exists
                utils.fileExists(baseDir).then(function(exists) {
                    if (exists) {
                        logger.debug("Standard base dir found: " + chalk.bold.green(baseDir), spaces);
                            
                        resolve(baseDir);                
                    } else {
                        var ex = new requireBaseExceptions.BaseDirNotFoundException();                        
                        logger.error(ex.message);
                        reject(ex);
                    }
                })
                .catch(function(error) {
                    var ex = new requireBaseExceptions.CantCheckBaseDirExistenceException(baseDir, error);
                    logger.error(ex.message);
                    reject(ex);
                });
            })
            .catch(function(error) {
                reject(error);
            });
        } else {
            // If base dir specified as argument check if exists
            utils.fileExists(baseDir).then(function(exists) {
                if (exists) {
                    logger.debug("Standard base dir specified by arguments: " + chalk.bold.green(baseDir), spaces);                        
                    resolve(baseDir);
                } else {
                    var ex = new requireBaseExceptions.BaseDirNotFoundException();                        
                    logger.error(ex.message);
                    reject(ex);
                }
            })
            .catch(function(error) {
                var ex = new requireBaseExceptions.CantCheckBaseDirExistenceException(baseDir, error);
                logger.error(ex.message);
                reject(ex);
            });
        }
    });
}

module.exports = getRequireBaseDir;