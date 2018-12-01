var Q = require('q');
var chalk = require('chalk');

var quarkConfFileExceptions = require('../exceptions/quarkConfFile.exceptions');

var logger = require('../utils/logger');
var qpmrc = require('../utils/qpmrc');
var utils = require('../utils/utils');

var argv = require('minimist')(process.argv.slice(2));

// Get's the target configuration file for install / uninstall command
function getQuarkConfigPath(spaces, args) {  
    spaces = spaces || "";
    
    return Q.Promise(function(resolve, reject) {
        // Config file to modify
        let target = "";

        if (!args || args == null) {
            args = argv;
        }

        // Check for c option
        if (args["c"]) {
            target = args["c"];
        }
        
        // Check for config parameter
        if (!target && args["config"]) {
            target = args["config"];
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
                            logger.error("Quark config file specified in .qpmrc doesn't exists");
                            reject(new quarkConfFileExceptions.QuarkConfFileNotFoundException());
                        }
                    })
                    .catch(function(error) {
                        var ex = new quarkConfFileExceptions.CantCheckQuarkConfigFileExistenceException(config.config, error);
                        logger.error(ex.message);
                        reject(ex);
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
                            var ex = new quarkConfFileExceptions.QuarkConfFileNotFoundException();
                            logger.error(ex.message);
                            reject(ex);
                        }
                    })
                    .catch(function(error) {
                        var ex = new quarkConfFileExceptions.CantCheckQuarkConfigFileExistenceException("tests/app/require.config.js|src/app/require.config.js", error);
                        logger.error(ex.message);
                        reject(ex);
                    });                        
                }    
            })
            .catch(function(error) {
                reject(error);
            });
        } else {
            logger.debug("Checking if specified config file exists: " + chalk.bold.green(target), spaces);

            // If quark config location is specified by parameters check if file exists
            utils.fileExists(target).then(function(exists) {
                if (!exists) {
                    var ex = new quarkConfFileExceptions.QuarkConfFileNotFoundException();
                    logger.error(ex.message);
                    reject(ex);
                } else {
                    logger.debug("Configuration file exists.", spaces);
                    resolve(target);
                }
            })
            .catch(function(error) {
                var ex = new quarkConfFileExceptions.CantCheckQuarkConfigFileExistenceException(target, error);
                logger.error(ex.message);
                reject(ex);
            })
        }
    });
}

module.exports = getQuarkConfigPath;