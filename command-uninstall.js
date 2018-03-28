var fs = require('fs');
var Q = require('Q');
var chalk = require('chalk');

var qpmrc = require('./qpmrc');
var rest = require('./rest');
var bower = require('./bower-node');
var quarkConfigurator = require('./quark-configurator');

var utils = require('./utils');

// Uninstall command
function uninstallCommand(package, argv, spaces, debug, callback) {
    spaces = spaces || "";

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

    // Check for config on qpmrc
    if (!target) {
        var config = qpmrc.read();

        if (config && config.config) {
            target = config.config;
        }
    }

    if (!target) {
        // Check on module's standard config file location
        if (fs.existsSync('tests/app/require.config.js')) {
            target = 'tests/app/require.config.js';
        }

        // Check on app's standand config file location
        if (fs.existsSync('src/app/require.config.js')) {
            target = 'src/app/require.config.js';
        }
    } else {
        // Check if the file really exists
        if (!fs.existsSync(argv["config"])) {
            target = "";
        }
    }

    // If config file is found
    if (target) {
        // Reads the quark config file
        var readQuarkConfigPromise = Q.Promise(function(resolve, reject) {
            fs.readFile(target, 'utf8', function (err, fileContent) {
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

                resolve(fileContent);
            });
        });

        var bowerListPromise = Q.Promise(function(resolve, reject) {
            var installed = {};

            bower.list(spaces, debug, function (result) {
                installed = utils.processBowerListResult(result, installed);

                resolve(installed);
            });
        });

        var bowerUninstallPromise = bowerListPromise.then(function(installed) {
            return Q.Promise(function(resolve, reject) {
                // Call bower uninstall
                if (package) {
                    console.log(chalk.green(spaces + "Uninstalling package %s..."), package);
                }

                bower.uninstall(package, true, "", debug, function (bowerPackages) {
                    var uninstalled = {};

                    for (let name in bowerPackages) {
                        console.log(chalk.white(spaces + "Bower Uninstalled: [", chalk.magenta(name), "]"));

                        uninstalled[name] = {
                            config: installed[name],
                            version: installed[name].version
                        };                        
                    }

                    resolve(uninstalled);
                });
            });            
        });

        var quarkConfigPromises = bowerUninstallPromise.then(function(mods) {
            var promises = new Array();
            
            // For each installed bower package
            for (let name in mods) {                
                promises.push(Q.Promise(function(resolve, reject) {
                    let bowerConfig = mods[name];
                    let version = bowerConfig.version;
                                            
                    // Get the package config from REST service
                    rest.getPackage(name, version, spaces, debug, function (quarkConfig) {
                        if (quarkConfig && debug) {
                            console.log(chalk.yellow("Received package info:"));
                            console.log(chalk.yellow("%s"), JSON.stringify(quarkConfig, null, 4));
                        }

                        bowerConfig.quark = quarkConfig;

                        resolve(bowerConfig);
                    });
                }));
            }

            return promises;
        });

        
        // With the quark config file and the quark configuration for each module
        var configureQuarkPromise = Q.all([readQuarkConfigPromise, quarkConfigPromises]).then(function(results) {
            // Get the bower config file
            var fileContent = results[0];

            // Wait for all quark configs are ready and apply to the quark's config file
            return Q.all(results[1]).then(function(bowerConfigs) {
                for (var i = 0; i < bowerConfigs.length; i++) {
                    var bowerConfig = bowerConfigs[i];

                    console.log(chalk.white(spaces + "Removing Quark configuration for: [", chalk.magenta(bowerConfig.config.name), "]"));

                    fileContent = quarkConfigurator.removePackage(bowerConfig.quark, bowerConfig, fileContent, spaces + "  ", debug);
                }

                return fileContent;
            });
        });

        // When all the configuration is done write the config file.
        configureQuarkPromise.then(function(quarkConfigContent) {
            if (debug) {
                console.log(chalk.yellow("Writing config file:"));
                console.log(chalk.yellow("%s"), target);
            }

            // Write the modified target file
            fs.writeFile(target, quarkConfigContent, 'utf8', function (err) {
                if (err) {
                    console.log(chalk.red("Error Writing File:"));
                    console.log(chalk.red("%j"), err);
                }
            });
        });
    } else {
        console.log(chalk.red("Can't find any of the required files. QPM searches on common config file locations, if your proyect has a custom config file location use the -c or --config option."));
    }        
}

module.exports = uninstallCommand;
