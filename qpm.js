#!/usr/bin/env node
var chalk = require('chalk');
var help = require('./help');

// Get required libs
var installCommand = require('./command-install');
var uninstallCommand = require('./command-uninstall');

// Process command arguments
var argv = require('minimist')(process.argv.slice(2));

// Obtain the debug flag
var debug = argv["d"];

if (debug) {
    console.log(chalk.yellow("Received commands parameters:"));
    console.log(chalk.yellow("%s"), JSON.stringify(argv, null, 4));
}

// Get command "qpm [command]"
var command = argv["_"][0];

// If no command specified show help
if (!command) {
    help.show();
    return;
}

// If command specified and -h parameter received show help
if (command && (argv["h"] || argv["help"])) {
    help.show(command);
    return;
}

// Execute selected command
switch (command) {
    case "install":
        // Get package name
        var package = argv["_"][1];

        // Call install
        installCommand(package, argv, "", debug, end);
        break;

    case "uninstall":
        // Get package name
        var package = argv["_"][1];

        // Call install
        uninstallCommand(package, argv, "", debug, end);
        break;
        
    default:
        help.show(command);
        break;
}

// Install command

function end() {
    console.log(chalk.green("Finished!"));
}
