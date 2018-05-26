var Q = require('q');

var logger = require('../utils/logger');
var qpmrc = require('../utils/qpmrc');
var utils = require('../utils/utils');

var argv = require('minimist')(process.argv.slice(2));

// Get the base dir where the app and bower_moudules high
function getRequireBaseDir(spaces) {
    spaces = spaces || "";

    return Q.Promise(function(resolve, reject) {
        // Base dir for application
        let baseDir = "";

        // Check for b option
        if (argv["b"]) {
            baseDir = argv["b"];
        }
        
        // Check for base parameter
        if (!baseDir && argv["base"]) {
            baseDir = argv["base"];
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
                        var msg = "Can't find a base dir for the application. By default qpm uses ./src if your base dir is custom use -b or --base parameters to specify it";
                        logger.error(msg);
                        reject(msg);
                    }
                })
                .catch(function(error) {
                    logger.error("Error reading base dir");
                    reject(error);
                });
            })
            .catch(function(error) {
                logger.error("Error reading .qpmrc file");
                reject(error);
            });
        } else {
            // If base dir specified as argument check if exists
            utils.fileExists(baseDir).then(function(exists) {
                if (exists) {
                    logger.debug("Standard base dir specified by arguments: " + chalk.bold.green(baseDir), spaces);
                        
                    resolve(baseDir);
                } else {
                    var msg = "Can't find the specified base dir.";
                    logger.error(msg);
                    reject(new Error(msg));
                }
            })
            .catch(function(error) {
                logger.error("An error ocurred reading the specified base dir");
                reject(error);
            });
        }
    });
}

module.exports = getRequireBaseDir;