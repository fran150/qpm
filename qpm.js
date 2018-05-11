#!/usr/bin/env node
var chalk = require('chalk');
var help = require('./help');

var args = require('./arguments');

// Get required libs
var commandInstall = require('./command-install');
var commandUninstall = require('./command-uninstall');
var commandLink = require('./command-link');

// Get command "qpm [command]"
var command = args.getCommand();

// If no command specified show help
if (!command) {
    help.show();
    return;
}

// If command specified and -h parameter received show help
if (command && args.isHelp()) {
    help.show(command);
    return;
}

// Execute selected command
switch (command) {
    case "install":
        // Get package name
        var package = args.getPackage();

        if (args.isDebug()) {
            console.log(chalk.yellow("Starting command install"));
        }

        // Call install
        commandInstall(package, "", end);
        break;

    case "uninstall":
        // Get package name
        var package = args.getPackage();

        if (args.isDebug()) {
            console.log(chalk.yellow("Starting command uninstall"));
        }
        
        // Call install
        commandUninstall(package, "", end);
        break;

    case "link":
        // Get package name
        var package = args.getPackage();

        if (args.isDebug()) {
            console.log(chalk.yellow("Starting command uninstall"));
        }
        
        // Call install
        commandLink(package, "", end);
        break;

    case "bundle":
        // Get package name
        var package = args.getPackage();

        if (args.isDebug()) {
            console.log(chalk.yellow("Starting command bundle"));
        }
        
        // Call install
        commandBundle(package, "", end);
        break;        
        
    default:
        help.show(command);
        break;
}

// Install command

function end() {
    console.log(chalk.green("Finished!"));
}
