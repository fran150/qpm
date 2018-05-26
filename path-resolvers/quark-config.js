var Q = require('q');

var logger = require('../utils/logger');
var qpmrc = require('../utils/qpmrc');
var utils = require('../utils/utils');

var argv = require('minimist')(process.argv.slice(2));

// Get's the target configuration file for install / uninstall command
function getQuarkConfigPath(spaces) {  
    spaces = spaces || "";
    
    return Q.Promise(function(resolve, reject) {
        // Config file to modify
        let target = "";

        // Check for c option
        if (argv["c"]) {
            target = argv["c"];
        }
        
        // Check for config parameter
        if (!target && argv["config"]) {
            target = argv["config"];
        }
        
        // If not target specified as parameter check for config on qpmrc
        if (!target) {
            logger.debug("Config parameter not specified, checking .qpmrc file", spaces);

            // Read qpmrc file
            qpmrc.read(spaces + "  ").then(function(config) {
                // If config specified in .qpmrc
                if (config && config.config) {
                    logger.debug("Checking if config file specified in .qpmrc exists: " + chalk.bold.green(target));
    
                    // Validate if config file specified in .qpmrc exists
                    utils.fileExists(config.config).then(function(exists) {
                        if (exists) {
                            resolve(config.config);
                        } else {
                            var msg = "Quark config file specified in .qpmrc doesn't exists";
                            logger.error(msg);
                            reject(msg);
                        }
                    })
                    .catch(function(error) {
                        logger.error("Can't read config file specified in .qpmrc");
                        reject(error);
                    });
                } else {
                    logger.debug("Quark config location not found on .qpmrc", spaces);
                    logger.debug("Searching config file on standard locations", spaces);
                    
                    // If config file not found on .qpmrc seach on standard locations
                    Q.all([utils.fileExists('tests/app/require.config.js'), utils.fileExists('tests/app/require.config.js')]).then(function(exists) {
                        if (exists[0]) {
                            logger.debug("Found on module's standard location", spaces);

                            target = 'tests/app/require.config.js';
                        }
    
                        if (exists[1]) {
                            logger.debug("Found on app's standard location", spaces);

                            target = 'src/app/require.config.js';
                        }
    
                        if (target) {
                            logger.debug("Found quark configuration file in " + chalk.bold.green(target));
                            
                            resolve(target);
                        } else {
                            var msg = "Quark's configuration file not found";
                            logger.error(msg);
                            reject(msg);
                        }
                    })
                    .catch(function (error) {
                        logger.error("Error trying to find the quark configuration file");
                        reject(error);
                    });                        
                }    
            })
            .catch(function(error) {
                logger.error("Error reading .qpmrc file");
                reject(error);
            });
        } else {
            logger.debug("Checking if specified config file exists: " + chalk.bold.green(target), spaces);

            // If quark config location is specified by parameters check if file exists
            utils.fileExists(target).then(function(exists) {
                if (!exists) {
                    reject("Quark's configuration file not found");
                } else {
                    logger.debug("Configuration file exists.", spaces);

                    resolve(target);
                }
            })
            .catch(function(error) {
                logger.error("Error trying to validate the specified configuration file");
                reject(error);
            })
        }
    });
}

module.exports = getQuarkConfigPath;