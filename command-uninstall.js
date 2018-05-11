var fs = require('fs');
var chalk = require('chalk');
var Q = require('Q');

var args = require('./arguments');
var quarkConfig = require('./quark-config');
var rest = require('./rest');
var bower = require('./bower-node');
var quarkConfigurator = require('./quark-configurator');

// Uninstall command
function uninstallCommand(package, spaces, callback) {
    spaces = spaces || "";

    // Gets the target config file from arguments, qpmrc or common location
    var configPathPromise = args.getConfigPath(spaces + "  ");

    // Reads the quark config file
    var readQuarkConfigPromise = quarkConfig.read(configPathPromise, spaces + "  ");
    
    // Get quark's config for each bower listed package
    var packageConfigPromise = Q.Promise(function(resolve, reject) {
        bower.list(spaces + "  ").then(function(installed) {
            if (args.isVerbose()) {
                console.log(chalk.white(installed));
            }

            bower.uninstall(package, true, spaces + "  ").then(function(bowerPackages) {
                var uninstalled = {};

                for (let name in bowerPackages) {
                    console.log(chalk.white(spaces + "Bower Uninstalled: [", chalk.magenta(name), "]"));

                    uninstalled[name] = {
                        config: installed[name],
                        version: installed[name].version
                    };                        
                }
                
                // Get the package config from REST service
                rest.getPackages(uninstalled, spaces + "  ").then(function(data) {                    
                    if (data) {
                        for (var name in data) {
                            if (args.isDebug()) {
                                console.log(chalk.yellow("Quark configuration found for package: " + chalk.white(name)));
                            }
    
                            // Append the quarks config to the bower info object
                            uninstalled[name].quark = data[name];
                        }
                    }

                    // Return the bower config
                    resolve(uninstalled);
                })
                .catch(function (error) {
                    console.log(chalk.red("Error downloading quark config for packages"));
                    reject(error)
                });                
            })
            .catch(function(error) {
                console.log(chalk.red("Error executing bower uninstall"));
                reject(error);
            });            
        })
        .catch(function(error) {
            console.log(chalk.red("Error executing bower list"));
            reject(error);
        })    
    });

    var configureQuarkPromise = Q.all([readQuarkConfigPromise, packageConfigPromise]).then(function(results) {
        // Get the bower config file
        var fileContent = results[0];
        var bowerConfigs = results[1];

        // Wait for all quark configs are ready and apply to the quark's config file
        for (var name in bowerConfigs) {
            var bowerConfig = bowerConfigs[name];

            if (bowerConfig.quark) {
                // Add package to quarks config
                fileContent = quarkConfigurator.removePackage(bowerConfig.quark, bowerConfig, fileContent, spaces + "  ");
            }
        }

        return fileContent;
    });

    // When all the configuration is done write the config file.
    Q.all([configureQuarkPromise, configPathPromise]).then(function(results) {
        var quarkConfigContent = results[0];
        var configPath = results[1];
        
        if (args.isDebug()) {
            console.log(chalk.yellow("Writing config file:"));
            console.log(chalk.yellow("%s"), configPath);
        }

        // Write the modified target file
        fs.writeFile(configPath, quarkConfigContent, 'utf8', function (err) {
            if (err) {
                console.log(chalk.red("Error Writing File:"));
                console.log(chalk.red("%j"), err);
            }
        });
    })
    .catch(function(error) {
        throw new Error(error);
    })
    .done();    
}

module.exports = uninstallCommand;
