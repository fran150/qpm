var fs = require('fs');
var chalk = require('chalk');

var rest = require('./rest');
var bower = require('./bower-node');
var quarkConfigurator = require('./quark-configurator');

// Install command
function installCommand(package, spaces, debug, callback) {
    spaces = spaces || "";

    var target = "";

    if (fs.existsSync('tests/app/require.config.js')) {
        target = 'tests/app/require.config.js';
    }

    if (fs.existsSync('src/app/require.config.js')) {
        target = 'src/app/require.config.js';
    }

    if (!target) {
        console.log(chalk.red("Can't find any of the required files. Check if your current directory is a quark project."));
    }

    if (target) {
        fs.readFile(target, 'utf8', function(err, fileContent) {
            if (err) {
                console.log(chalk.red("Error Reading File:"));
                console.log(chalk.red("%j"), err);
            }

            console.log(chalk.green(spaces + "Installing package %s..."), package);

            bower.install(package, true, "", debug, function(bowerPackages) {
                var waiting = 0;

                for (var name in bowerPackages) {
                    var bowerConfig = bowerPackages[name];

                    console.log(chalk.green("Bower Installed: [", chalk.white(name), "]"));

                    waiting++;
                    // Get the package config from REST service
                    rest.getPackage(name, spaces, debug, function(quarkConfig) {
                        if (quarkConfig) {
                            if (debug) {
                                console.log(chalk.yellow("Received package info:"));
                                console.log(chalk.yellow("%s"), JSON.stringify(quarkConfig, null, 4));
                            }

                            if (quarkConfig.config && quarkConfig.config != null) {
                                fileContent = quarkConfigurator.addPackage(quarkConfig, bowerConfig, fileContent, spaces + "  ", debug);
                            }
                        }

                        waiting--;

                        if (waiting == 0) {
                            fs.writeFile(target, fileContent, 'utf8', function(err) {
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
    }
}

module.exports = installCommand;
