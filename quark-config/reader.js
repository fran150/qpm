var fs = require('fs');
var Q = require('Q');
var chalk = require('chalk');

var quarkConfFileExceptions = require("../exceptions/quarkConfFile.exceptions");

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
                        var ex = new quarkConfFileExceptions.ErrorReadingQuarkConfFileException(configPath, err);                        
                        logger.error(ex.message);    
                        reject(ex);
                    } else {
                        logger.verbose(fileContent);
        
                        // Verifica el archivo de configuracion
                        if (!quarkConfigurator.checkConfig(fileContent, spaces + "  ")) {
                            var ex = new quarkConfFileExceptions.InvalidQuarkConfFileException();
                            logger.error(ex.message);
                            reject(ex);
                        } else {
                            logger.debug("Quark's configuration file valid.", spaces);
    
                            // Return the config file content
                            resolve(fileContent);
                        }    
                    }
                });
            })
            .catch(function(error) {
                reject(error);
            });
        });
    }
}


module.exports = new QuarkConfigReader();