var fs = require('fs');
var chalk = require('chalk');

var qpmrc = require('./qpmrc');
var rest = require('./rest');
var bower = require('./bower-node');
var quarkConfigurator = require('./quark-configurator');

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

        if (fs.existsSync("./src")) {
            baseDir = "./src";
        }
    }

    // If config file is found
    if (target) {
        // Reads the config file
        fs.readFile(target, 'utf8', function(err, fileContent) {
            // If there's an error reading the config file
            if (err) {
                console.log(chalk.red("Error Reading File:"));
                console.log(chalk.red("%j"), err);
                return;
            }            

            // Verifica el archivo de configuracion
            if (!quarkConfigurator.checkConfig(fileContent, spaces, debug)) {
                console.log(chalk.red("The config file does not contain a valid requireConfigure call with path and shim."));
                return;
            }

            // Call bower install
            if (package) {
                console.log(chalk.green(spaces + "Installing package %s..."), package);
            }
                        
            bower.install(package, true, "", debug, function(bowerPackages) {
                let waiting = 0;

                // For each installed bower package
                for (let name in bowerPackages) {
                    console.log(chalk.white(spaces + "Bower Installed: [", chalk.green(name), "]"));
                }

                bower.list(spaces, debug, function (result) {
                    var mods = {};

                    mods = processBowerData(result, mods);

                    // For each installed bower package
                    for (let name in mods) {
                        let bowerConfig = mods[name];

                        waiting++;
                        // Get the package config from REST service
                        rest.getPackage(name, spaces, debug, function (quarkConfig) {
                            if (quarkConfig) {
                                if (debug) {
                                    console.log(chalk.yellow("Received package info:"));
                                    console.log(chalk.yellow("%s"), JSON.stringify(quarkConfig, null, 4));
                                }

                                console.log(chalk.white(spaces + "Configuring Quark for: [", chalk.green(name), "]"));                                

                                if (quarkConfig.config && quarkConfig.config != null) {
                                    fileContent = quarkConfigurator.addPackage(quarkConfig, bowerConfig, fileContent, spaces + "  ", debug, baseDir);
                                }
                            }

                            waiting--;

                            if (waiting == 0) {
                                fs.writeFile(target, fileContent, 'utf8', function (err) {
                                    if (err) {
                                        console.log(chalk.red("Error Writing File:"));
                                        console.log(chalk.red("%j"), err);
                                    }

                                    callback();
                                });
                            }
                        });
                    }
                    
                });
            });
        });
    } else {
        console.log(chalk.red("Can't find any of the required files. QPM searches on common config file locations, if your proyect has a custom config file location use the -c or --config option."));        
    }
}

function processBowerData(data, result) {    
    result[data.pkgMeta.name] = {
        dir: data.canonicalDir,
        version: data.pkgMeta.version
    };

    if (data.dependencies) {
        for (var index in data.dependencies) {
            result = processBowerData(data.dependencies[index], result);
        }            
    }

    return result;
}

module.exports = installCommand;
