var fs = require('fs');
var Q = require('Q');
var chalk = require('chalk');

var args = require('./arguments');
var quarkConfigurator = require('./quark-configurator');

function QuarkConfig() {
    var self = this;

    // Reads the quark config file
    this.read = function(configPathPromise, spaces) {
        return Q.Promise(function(resolve, reject) {
            configPathPromise.then(function(configPath) {
                if (args.isDebug()) {
                    console.log(chalk.yellow(spaces + "Reading quark's configuration file: " + chalk.white(configPath)));
                }

                // Reads the config file
                fs.readFile(configPath, 'utf8', function (err, fileContent) {
                    // If there's an error reading the config file
                    if (err) {
                        console.log(chalk.red("Error Reading File:"));
                        console.log(chalk.red("%j"), err);
    
                        reject(new Error("Error reading the quark configuration file."));
                    }

                    if (args.isDebug() && args.isVerbose()) {
                        console.log(chalk.white(fileContent));
                    }
    
                    // Verifica el archivo de configuracion
                    if (!quarkConfigurator.checkConfig(fileContent, spaces + "  ")) {
                        console.log(chalk.red("The config file does not contain a valid requireConfigure call with path and shim."));    
                        reject(new Error("Configuration file invalid."));
                    } else {
                        if (args.isDebug()) {
                            console.log(chalk.yellow(spaces + "Quark's configuration file valid."));
                        }

                        // Return the config file content
                        resolve(fileContent);
                    }                        
                });
            })
            .catch(function(error) {
                console.log(chalk.red("Error reading quark's config file"));
                reject(error);
            });
        });
    }
}


module.exports = new QuarkConfig();