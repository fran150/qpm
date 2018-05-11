var fs = require('fs');
var chalk = require('chalk');
var Q = require('q');
var merge = require('merge-array-object');

var args = require('./arguments');
var quarkConfig = require('./quark-config');
var rest = require('./rest');
var bower = require('./bower-node');
var quarkConfigurator = require('./quark-configurator');

// Install command
function linkCommand(package, spaces, callback) {
    spaces = spaces || "";

    // Gets the target config file from arguments, qpmrc or common location
    var configPathPromise = args.getConfigPath(spaces + "  ");

    // Gets the base dir
    var baseDirPromise = args.getBaseDir(spaces + "  ");

    // Reads the quark config file
    var readQuarkConfigPromise = quarkConfig.read(configPathPromise, spaces + "  ");

    // Get quark's config for each bower listed package
    var packageConfigPromise = Q.Promise(function(resolve, reject) {
        bower.link(package, spaces + "  ").then(function() {
            bower.list(spaces + "  ").then(function(mods) {
                if (args.isVerbose()) {
                    console.log(chalk.white(mods));
                }
                
                // Get the package config from REST service
                rest.getPackages(mods, spaces + "  ").then(function(data) {                    
                    if (data) {
                        for (var name in data) {
                            if (args.isDebug()) {
                                console.log(chalk.yellow("Quark configuration found for package: " + chalk.white(name)));
                            }
    
                            // Append the quarks config to the bower info object
                            mods[name].quark = data[name];
                        }
                    }

                    // Return the bower config
                    resolve(mods);
                })
                .catch(function (error) {
                    console.log(chalk.red("Error downloading quark config for packages"));
                    reject(error)
                });                        
            })    
            .catch(function(error) {
                console.log(chalk.red("Error executing bower list"));
                reject(error);
            })
        })
        .catch(function(error) {
            console.log(chalk.red("Error executing bower install"));
            reject(error);
        });
    })
    
    // With the quark config file and the quark configuration for each module
    var configureQuarkPromise = Q.all([readQuarkConfigPromise, packageConfigPromise, baseDirPromise]).then(function(results) {
        // Get the bower config file
        var fileContent = results[0];
        var bowerConfigs = results[1];
        var baseDir = results[2];

        // Wait for all quark configs are ready and apply to the quark's config file
        for (var name in bowerConfigs) {
            var bowerConfig = bowerConfigs[name];

            if (bowerConfig.quark) {
                // Add package to quarks config
                fileContent = quarkConfigurator.addPackage(bowerConfig.quark, bowerConfig, fileContent, spaces + "  ", baseDir);
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

module.exports = linkCommand;
