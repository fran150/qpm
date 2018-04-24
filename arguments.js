var Q = require('Q');
var qpmrc = require('./qpmrc');
var utils = require('./utils');

var argv = require('minimist')(process.argv.slice(2));

function ArgumentProcessor() {
    var self = this;

    // Get's the target configuration file for install / uninstall command
    this.getConfigPath = function() {    
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
                var config = qpmrc.read();

                if (config && config.config) {
                    target = config.config;
                }
            }

            // If no target config specified as parameter or in .qpmrc
            if (!target) {
                // Check on module's standard config file location
                utils.fileExists('tests/app/require.config.js').then(function(exists) {
                    if (exists) {
                        target = 'tests/app/require.config.js';
                    }                
                }).then(utils.fileExists('src/app/require.config.js').then(function(exists) {
                    if (exists) {
                        target = 'src/app/require.config.js';
                    }
                })).then(function() {
                    resolve(target);
                });
            } else {
                utils.fileExists(argv["config"]).then(function(exists) {
                    if (!exists) {
                        resolve("")
                    } else {
                        resolve(argv["config"]);
                    }
                });
            }
        });
    }

    // Get the base dir where the app and bower_moudules high
    this.getBaseDir = function() {
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

            utils.fileExists(baseDir).then(function(exists) {
                if (exists) {
                    resolve(baseDir);                
                } else {
                    var msg = "Can't find a base dir for the application. By default qpm uses ./src if your base dir is custom use -b or --base parameters to specify it";
                    console.log(chalk.red(msg));
                    reject(new Error(msg));
                }
            });
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