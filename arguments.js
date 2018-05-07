var Q = require('Q');
var chalk = require('chalk');

var qpmrc = require('./qpmrc');
var utils = require('./utils');

var argv = require('minimist')(process.argv.slice(2));

// Process specified arguments
function ArgumentProcessor() {
    var self = this;

    // Is Debug mode
    this.isDebug = function() {
        return argv["d"] || argv["debug"];        
    }

    // Is Verbose mode
    this.isVerbose = function() {
        return argv["v"] || argv["verbose"];        
    }

    // Must show help
    this.isHelp = function() {
        return argv["h"] || argv["help"];        
    }
    
    // Get the specified command name
    this.getCommand = function() {
        return argv["_"][0];
    }

    // Get the specified package name
    this.getPackage = function() {
        return argv["_"][1];
    }

    // Get's the target configuration file for install / uninstall command
    this.getConfigPath = function(spaces) {    
        return Q.Promise(function(resolve, reject) {
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
                if (self.isDebug()) {
                    console.log(chalk.yellow(spaces + "Config parameter not specified, checking .qpmrc file"))
                }

                // Read qpmrc file
                qpmrc.read(self.isDebug(), self.isVerbose(), spaces + "  ").then(function(config) {
                    // If config specified in .qpmrc
                    if (config && config.config) {
                        if (self.isDebug()) {
                            console.log(chalk.yellow(spaces + "Checking if config file specified in .qpmrc exists: " + chalk.white(target)));
                        }
        
                        // Validate if config file specified in .qpmrc exists
                        utils.fileExists(config.config).then(function(exists) {
                            if (exists) {
                                resolve(config.config);
                            } else {
                                var msg = "Quark config file specified in .qpmrc doesn't exists";
                                console.log(chalk.red(msg));
                                reject(msg);
                            }
                        })
                        .catch(function(error) {
                            console.log(chalk.red("Can't read config file specified in .qpmrc"));
                            reject(error);
                        });
                    } else {
                        if (self.isDebug()) {
                            console.log(chalk.yellow(spaces + "Quark config location not found on .qpmrc"))
                            console.log(chalk.yellow(spaces + "Searching config file on standard locations"));
                        }
                        
                        // If config file not found on .qpmrc seach on standard locations
                        Q.all([utils.fileExists('tests/app/require.config.js'), utils.fileExists('tests/app/require.config.js')]).then(function(exists) {
                            if (exists[0]) {
                                if (self.isDebug()) {
                                    console.log(chalk.yellow(spaces + "Found on module's standard location"))
                                }    
        
                                target = 'tests/app/require.config.js';
                            }
        
                            if (exists[1]) {
                                if (self.isDebug()) {
                                    console.log(chalk.yellow(spaces + "Found on app's standard location"))
                                }    
                                
                                target = 'src/app/require.config.js';
                            }
        
                            if (target) {
                                if (self.isDebug()) {
                                    console.log(chalk.yellow(spaces + "Found quark configuration file in " + chalk.white(target)));
                                }    
                                
                                resolve(target);
                            } else {
                                console.log(chalk.red("Quark's configuration file not found"));
                                reject("Quark's configuration file not found");
                            }
                        })
                        .catch(function (error) {
                            console.log(chalk.red("Error trying to find the quark configuration file"));
                            reject(error);
                        });                        
                    }    
                })
                .catch(function(error) {
                    console.log(chalk.red("Error reading .qpmrc file"));
                    reject(error);
                });
            } else {
                if (self.isDebug()) {
                    console.log(chalk.yellow(spaces + "Checking if specified config file exists: " + chalk.white(target)));
                }

                // If quark config location is specified by parameters check if file exists
                utils.fileExists(target).then(function(exists) {
                    if (!exists) {
                        reject("Quark's configuration file not found");
                    } else {
                        if (self.isDebug()) {
                            console.log(chalk.yellow(spaces + "Configuration file exists."));
                        }
                            
                        resolve(target);
                    }
                })
                .catch(function(error) {
                    console.log(chalk.red("Error trying to validate the specified configuration file"));
                    reject(error);
                })
            }
        });
    }

    // Get the base dir where the app and bower_moudules high
    this.getBaseDir = function(spaces) {
        return Q.Promise(function(resolve, reject) {
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
            
            // If base dir not specified as argument
            if (!baseDir) { 
                if (self.isDebug()) {
                    console.log(chalk.yellow(spaces + "Base dir parameter not specified, checking .qpmrc file"))
                }
                
                // Search on .qpmrc
                qpmrc.read(self.isDebug(), self.isVerbose(), spaces + "  ").then(function(config) {
                    // If config has a base parameter then use that value if not
                    // use standard base dir
                    if (config && config.base) {
                        if (self.isDebug()) {
                            console.log(chalk.yellow(spaces + "Base dir config found on .qpmrc"))
                        }
                        
                        // Use specified in .qpmrc
                        baseDir = config.base;
                    } else {
                        if (self.isDebug()) {
                            console.log(chalk.yellow(spaces + "Base dir config not found on .qpmrc"))
                            console.log(chalk.yellow(spaces + "Checking standard base dir"));
                        }
                        
                        // Set default
                        baseDir = "./src";
                    }

                    // Check if the specified base dir exists
                    utils.fileExists(baseDir).then(function(exists) {
                        if (exists) {
                            if (self.isDebug()) {
                                console.log(chalk.yellow(spaces + "Standard base dir found: " + chalk.white(baseDir)));
                            }
                                
                            resolve(baseDir);                
                        } else {
                            var msg = "Can't find a base dir for the application. By default qpm uses ./src if your base dir is custom use -b or --base parameters to specify it";
                            console.log(chalk.red(msg));
                            reject(new Error(msg));
                        }
                    })
                    .catch(function(error) {
                        console.log(chalk.red("Error reading base dir"));
                        reject(error);
                    });
                })
                .catch(function(error) {
                    console.log(chalk.red("Error reading .qpmrc file"));
                    reject(error);
                });
            } else {
                // If base dir specified as argument check if exists
                utils.fileExists(baseDir).then(function(exists) {
                    if (exists) {
                        if (self.isDebug()) {
                            console.log(chalk.yellow(spaces + "Standard base dir specified by arguments: " + chalk.white(baseDir)));
                        }
                            
                        resolve(baseDir);
                    } else {
                        var msg = "Can't find the specified base dir.";
                        console.log(chalk.red(msg));
                        reject(new Error(msg));
                    }
                })
                .catch(function(error) {
                    console.log(chalk.red("An error ocurred reading the specified base dir"));
                    reject(error);
                });
            }
        });
    }

    // Gets the gulp config file
    this.getGulpConfPath = function() {
        let gulpJsonFile;

        // Check for gulp file parameter
        if (argv["g"]) {
            gulpJsonFile = argv["g"];
        }

        // Check for bundles parameters
        if (!gulpJsonFile && argv["gulpfile"]) {
            gulpJsonFile = argv["gulpfile"];
        }

        // If no bundling json specified set the default location
        if (!gulpJsonFile || gulpJsonFile === true) {
            gulpJsonFile = "./gulp.conf.json";
        }
        
        return gulpJsonFile;
    }
}

module.exports = new ArgumentProcessor();