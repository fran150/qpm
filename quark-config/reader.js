var fs = require('fs');
var Q = require('Q');
var chalk = require('chalk');

var logger = require('../utils/logger');
var quarkConfigurator = require('./configurator');

function QuarkConfigReader() {
    var self = this;

    // Reads the quark config file
    this.read = function(configPathPromise, spaces) {
        return Q.Promise(function(resolve, reject) {
            configPathPromise.then(function(configPath) {
                logger.debug("Reading quark's configuration file: " + chalk.white(configPath));

                // Reads the config file
                fs.readFile(configPath, 'utf8', function (err, fileContent) {
                    // If there's an error reading the config file
                    if (err) {
                        logger.error("Error reading the quark configuration file.");    
                        reject(err);
                    } else {
                        logger.verbose(fileContent);
        
                        // Verifica el archivo de configuracion
                        if (!quarkConfigurator.checkConfig(fileContent, spaces + "  ")) {
                            var msg = "The config file does not contain a valid requireConfigure call with path and shim.";
                            logger.error(msg);
                            reject(msg);
                        } else {
                            logger.debug("Quark's configuration file valid.", spaces);
    
                            // Return the config file content
                            resolve(fileContent);
                        }    
                    }
                });
            })
            .catch(function(error) {
                logger.error("Error reading quark's config file", spaces);
                reject(error);
            });
        });
    }
}


module.exports = new QuarkConfigReader();