var fs = require('fs');
var chalk = require('chalk');
var Q = require('q');
var merge = require('merge-array-object');

var qpmrc = require('./qpmrc');
var rest = require('./rest');
var bower = require('./bower-node');
var quarkConfigurator = require('./quark-configurator');

var utils = require('./utils');

// Install command
function installCommand(package, argv, spaces, debug, callback) {
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
    
    // If not target specified as parameter check for config on qpmrc
    if (!target) {
        var config = qpmrc.read();

        if (config && config.config) {
            target = config.config;
        }
    }

    // If no target config specified as parameter or in .qpmrc
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

    // Base dir for application
    let baseDir = "";

    // Check for b option
    if (argv["b"]) {
        baseDir = argv["b"];
    }
    
    // Check for base parameter
    if (!baseDir && argv["base"]) {
        baseDir = argv["base"];
    }
    
    // Check for config on qpmrc
    if (!baseDir) { 
        var config = qpmrc.read();

        if (config && config.base) {
            baseDir = config.base;
        }
    }

    // If no base dir specified as parameter or in .qpmrc
    if (!baseDir) {
        // Set default
        baseDir = "./src";
    }

    // Validate base dir
    if (!fs.existsSync(baseDir)) {
        console.log(chalk.red("Can't find a base dir for the application. By default qpm uses ./src if your base dir is custom use -b or --base parameters to specify it"));
    }

    let updateGulp = false;
    let gulpJsonFile = "";

    // Check for gulp file parameter
    if (argv["g"]) {
        updateGulp = true;
        gulpJsonFile = argv["g"];
    }

    // Check for bundles parameters
    if (!gulpJsonFile && argv["gulpfile"]) {
        updateGulp = true;
        gulpJsonFile = argv["gulpfile"];
    }

    // If no bundling json specified set the default location
    if (!gulpJsonFile || gulpJsonFile === true) {
        gulpJsonFile = "./gulp.conf.json";
    }

    // If config file is found
    if (target) {
        // Read quark config promise
        var readQuarkConfigPromise = Q.Promise(function(resolve, reject) {
            // Reads the config file
            fs.readFile(target, 'utf8', function(err, fileContent) {
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

        // Call bower install promise
        var bowerInstallPromise = Q.Promise(function(resolve, reject) {
            // Call bower install
            if (package) {
                console.log(chalk.green(spaces + "Installing package %s..."), package);
            }
         
            bower.install(package, true, "", debug, function(bowerPackages) {
                // For each installed bower package
                for (let name in bowerPackages) {
                    console.log(chalk.white(spaces + "Bower Installed: [", chalk.green(name), "]"));
                }

                var mods = {};

                if (bowerPackages) {
                    // Get the installed package data
                    mods = utils.processBowerInstallResult(bowerPackages, mods);    
                }

                // Return installed bower packages
                resolve(mods);
            });
        });

        var gulpFilePromise = Q.Promise(function(resolve, reject) {
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

        // Call bower list after bower install promise
        var bowerListPromise = bowerInstallPromise.then(function() {
            return Q.Promise(function(resolve, reject) {
                // Call bower list to get the installed files
                bower.list(spaces, debug, function (result) {
                    var mods = {};

                    // Get the installed package data
                    mods = utils.processBowerListResult(result, mods);

                    // Return the installed bower modules
                    resolve(mods);
                });
            });
        });

        // Get quark's config for each bower listed package
        var quarkConfigPromises = bowerListPromise.then(function(mods) {
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
        }); 

        var bundlePromises = Q.all([bowerInstallPromise, quarkConfigPromises]).then(function(data) {
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

        var configureGulpPromise = Q.all([gulpFilePromise, bundlePromises]).then(function(results) {
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
                console.log(chalk.yellow("%s"), target);
            }

            // Write the modified target file
            fs.writeFile(target, quarkConfigContent, 'utf8', function (err) {
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
    } else {
        console.log(chalk.red("Can't find any of the required files. QPM searches on common config file locations, if your proyect has a custom config file location use the -c or --config option."));        
    }
}

module.exports = installCommand;
