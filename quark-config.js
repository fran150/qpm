var fs = require('fs');
var Q = require('Q');
var chalk = require('chalk');


var arg = require('./arguments');
var quarkConfigurator = require('./quark-configurator');

function QuarkConfig() {
    var self = this;

    // Reads the quark config file
    this.read = function(configPathPromise, debug, spaces) {
        return Q.Promise(function(resolve, reject) {
            configPathPromise.then(function(configPath) {
                // Reads the config file
                fs.readFile(configPath, 'utf8', function(err, fileContent) {
                    // If there's an error reading the config file
                    if (err) {
                        console.log(chalk.red("Error Reading File:"));
                        console.log(chalk.red("%j"), err);
    
                        reject(new Error("Quark's configuration file not found."));
                    }

                    // Verifica el archivo de configuracion
                    if (!quarkConfigurator.checkConfig(fileContent, spaces, debug)) {
                        console.log(chalk.red("The config file does not contain a valid requireConfigure call with path and shim."));
    
                        reject(new Error("Configuration file invalid."));
                    }
    
                    // Return the config file content
                    resolve(fileContent);
                });
            }).done();
        });
    }
}


module.exports = new QuarkConfig();