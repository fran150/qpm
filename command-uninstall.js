var fs = require('fs');
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
        // Reads the config file
        fs.readFile(target, 'utf8', function (err, fileContent) {
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

            var installed = {};

            bower.list(spaces, debug, function (result) {
                installed = utils.processBowerData(result, installed);

                // Call bower uninstall
                if (package) {
                    console.log(chalk.green(spaces + "Uninstalling package %s..."), package);
                }

                bower.uninstall(package, true, "", debug, function (bowerPackages) {
                    let waiting = 0;

                    // For each uninstalled bower package
                    for (let name in bowerPackages) {
                        let bowerConfig = installed[name];
                        let version = bowerConfig.version;

                        console.log(chalk.white(spaces + "Bower Uninstalled: [", chalk.magenta(name), "]"));

                        waiting++;
                        // Get the package config from REST service
                        rest.getPackage(name, version, spaces, debug, function (quarkConfig) {
                            if (quarkConfig) {
                                if (debug) {
                                    console.log(chalk.yellow("Uninstall package info:"));
                                    console.log(chalk.yellow("%s"), JSON.stringify(quarkConfig, null, 4));
                                }

                                console.log(chalk.white(spaces + "Removing Quark configuration for: [", chalk.magenta(name), "]"));

                                fileContent = quarkConfigurator.removePackage(quarkConfig, bowerConfig, fileContent, spaces + "  ", debug);
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

module.exports = uninstallCommand;
