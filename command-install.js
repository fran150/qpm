var fs = require('fs');
var chalk = require('chalk');
var Q = require('q');
var merge = require('merge-array-object');

var rest = require('./rest');
var bower = require('./bower-node');
var quarkConfigurator = require('./quark-configurator');
var arg = require('./arguments');

// Install command
function installCommand(package, spaces, debug, callback) {
    spaces = spaces || "";

    // Gets the target config file from arguments or qpmrc
    var configPathPromise = arg.getConfigPath(debug, spaces);
    // Gets the gulp configuration
    var gulpConfPathPromise = arg.getGulpConfPath(debug, spaces);
    // Gets the base dir for the proyect
    var baseDirPromise = arg.getBaseDir(debug, spaces);

    // Read quark config promise
    var readQuarkConfigPromise = 
        Q.Promise(function(resolve, reject) {
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
    });

    var readGulpConfigPromise = Q.Promise(function(resolve, reject) {
        if (debug) {
            console.log(chalk.yellow("Reading gulp config file:"));
            console.log(chalk.yellow("%s"), gulpJsonFile);
        }
                    
        fs.exists(gulpJsonFile, function(exists) {
            if (exists) {
                fs.readFile(gulpJsonFile, 'utf8', function(err, data) {
                    if (!err) {
                        var gulpJson = JSON.parse(data);                            

                        resolve(gulpJson);
                    } else {
                        reject(err);
                    }
                });
            } else {
                resolve();
            }    
        });
    });

    // Get quark's config for each bower listed package
    var quarkConfigPromises = bower.install(package).then(
        bower.list().then(function(mods) {
            var promises = new Array();
            
            // For each installed bower package
            for (let name in mods) {
                let bowerConfig = mods[name];
                let version = bowerConfig.version;

                // Return a promise for each config data
                promises.push(Q.Promise(function(resolve, reject) {
                    // Get the package config from REST service
                    rest.getPackage(name, version, spaces, debug, function(quarkConfig) {
                        if (quarkConfig && debug) {
                            console.log(chalk.yellow("Received package info:"));
                            console.log(chalk.yellow("%s"), JSON.stringify(quarkConfig, null, 4));
                        }

                        // Append the quarks config to the bower info object
                        bowerConfig.quark = quarkConfig;

                        // Return the bower config
                        resolve(bowerConfig);
                    });
                }));
            }

            // Return a promise array with each module config
            return promises;
        })
    );

    var bundlePromises = quarkConfigPromises.then(function(data) {
        var mods = data[0];
        var promises = new Array();

        console.log(chalk.green(spaces + "Searching for bundling info on installed packages..."));            
        
        // For each installed bower package
        for (let name in mods) {
            let bowerConfig = mods[name];

            // Return a promise for each config data
            promises.push(Q.Promise(function(resolve, reject) {                    
                fs.exists(bowerConfig.dir + "/bundling.json", function(exists) {                        
                    if (exists) {                                    
                        fs.readFile(bowerConfig.dir + '/bundling.json', 'utf8', function(err, fileContent) {                                
                            if (!err) {
                                console.log(chalk.white(spaces + "Found bundle config for %s..."), name);

                                if (debug) {
                                    console.log(chalk.yellow("Received bundle info:"));
                                    console.log(chalk.yellow("%s"), JSON.stringify(fileContent, null, 4));
                                }

                                var bundleConfig = JSON.parse(fileContent);
                                resolve(bundleConfig);
                            } else {
                                reject(new Error(err));
                            }                                    
                        });
                    } else {
                        resolve();
                    }
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

                // Add package to quarks config
                fileContent = quarkConfigurator.addPackage(bowerConfig.quark, bowerConfig, fileContent, spaces + "  ", debug, baseDir);
            }

            return fileContent;
        });
    });

    var configureGulpPromise = Q.all([ readGulpConfigPromise, bundlePromises]).then(function(results) {
        var gulpJson = results[0];

        return Q.all(results[1]).then(function(bundleConfigs) {
            for (var i = 0; i < bundleConfigs.length; i++) {
                var bundleConfig = bundleConfigs[i];

                if (bundleConfig) {
                    gulpJson = merge(gulpJson, bundleConfig);    
                }
            }

            return gulpJson;
        });
    });
    

    // When all the configuration is done write the config file.
    Q.all([configureQuarkPromise, configureGulpPromise]).then(function(results) {
        var quarkConfigContent = results[0];
        var gulpConfigContent = results[1];
        
        if (debug) {
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
        }
    });        
}

module.exports = installCommand;
