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
function installCommand(package, spaces, callback) {
    spaces = spaces || "";

    // Gets the target config file from arguments, qpmrc or common location
    var configPathPromise = args.getConfigPath(spaces + "  ");

    // Gets the gulp configuration
    //var gulpConfPathPromise = args.getGulpConfPath(spaces + "  ");

    // Gets the base dir
    var baseDirPromise = args.getBaseDir(spaces + "  ");

    // Reads the quark config file
    var readQuarkConfigPromise = quarkConfig.read(configPathPromise, spaces + "  ");

    // Get quark's config for each bower listed package
    var packageConfigPromises = Q.Promise(function(resolve, reject) {
        bower.install(package, true, spaces + "  ").then(function() {
            bower.list(spaces + "  ").then(function(mods) {
                var promises = new Array();

                // For each installed bower package
                for (let name in mods) {
                    let bowerConfig = mods[name];
                    let version = bowerConfig.version;
    
                    // Return a promise for each config data
                    promises.push(Q.Promise(function(resolve2, reject2) {
                        // Get the package config from REST service
                        rest.getPackage(name, version, spaces + "  ").then(function(data) {
                            if (data && data.name) {
                                if (args.isDebug()) {
                                    console.log(chalk.yellow("Quark configuration found for package: " + chalk.white(data.name)));
                                }
    
                                // Append the quarks config to the bower info object
                                bowerConfig.quark = data;        
                            }

                            // Return the bower config
                            resolve2(bowerConfig);
                        })
                        .catch(function (error) {
                            console.log(chalk.red("Error downloading quark config for package"));
                            reject2(error)
                        });                        
                    }));
                }
    
                // Return a promise array with each module config
                resolve(promises);
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
    var configureQuarkPromise = Q.all([readQuarkConfigPromise, packageConfigPromises, baseDirPromise]).then(function(results) {
        // Get the bower config file
        var fileContent = results[0];
        var baseDir = results[2];

        // Wait for all quark configs are ready and apply to the quark's config file
        return Q.all(results[1]).then(function(bowerConfigs) {
            for (var i = 0; i < bowerConfigs.length; i++) {
                var bowerConfig = bowerConfigs[i];

                if (bowerConfig.quark) {
                    // Add package to quarks config
                    fileContent = quarkConfigurator.addPackage(bowerConfig.quark, bowerConfig, fileContent, spaces + "  ", baseDir);
                }
            }

            return fileContent;
        });
    });

    // When all the configuration is done write the config file.
    Q.all([configureQuarkPromise, configPathPromise]).then(function(results) {
        var quarkConfigContent = results[0];
        var configPath = results[1];

        //var gulpConfigContent = results[1];
        
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
/*
        if (updateGulp) {
            if (debug) {
                console.log(chalk.yellow("Writing gulp config file:"));
                console.log(chalk.yellow("%s"), gulpJsonFile);
            }

            // Write the modified target file
            fs.writeFile(gulpJsonFile, JSON.stringify(gulpConfigContent, null, 4), 'utf8', function (err) {
                if (err) {
                    console.log(chalk.red("Error Writing File:"));
                    console.log(chalk.red("%j"), err);
                }
            });                    
        }*/
    })
    .catch(function(error) {
        throw new Error(error);
    })
    .done();        
}

module.exports = installCommand;
