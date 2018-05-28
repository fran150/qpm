#!/usr/bin/env node
var chalk = require('chalk');
var help = require('./help');

var logger = require('./utils/logger');

// Get required libs
var commandInstall = require('./commands/install');
var commandUninstall = require('./commands/uninstall');
var commandLink = require('./commands/link');
var commandBundle = require('./commands/bundle');
var commandRebundle = require('./commands/rebundle');
var commandUnbundle = require('./commands/unbundle');
var commandRegister = require('./commands/register');

var argv = require('minimist')(process.argv.slice(2));

// Get command "qpm [command]"
var command = argv["_"][0];

// If no command specified show help
if (!command) {
    help.show();
    return;
}

// If command specified and -h parameter received show help
if (command && (argv['h'] || argv['help'])) {
    help.show(command);
    return;
}

function getPackage(required) {
    var package = argv["_"][1];

    if (required && !package) {
        logger.error("Must specify a package name");
        throw new Error("Package name not specified");
    }
}

// Execute selected command
switch (command) {
    case "install":
        // Get package name
        var package = getPackage(false);

        logger.debug("Starting command install");

        // Call install
        commandInstall(package, "", end);
        break;

    case "uninstall":
        // Get package name
        var package = getPackage(true);

        logger.debug("Starting command uninstall");

        // Call install
        commandUninstall(package, "", end);
        break;

    case "link":
        // Get package name
        var package = getPackage(true);

        logger.debug("Starting command link");
                
        // Call install
        commandLink(package, "", end);
        break;

    case "bundle":
        // Get package name
        var package = getPackage(true);

        logger.debug("Starting command bundle");
        
        // Call install
        commandBundle(package, "", end);
        break;        

    case "rebundle":
        logger.debug("Starting command rebundle");
        
        // Call install
        commandRebundle(package, "", end);
        break;    
        
    case "unbundle":
        // Get package name
        var package = getPackage(true);

        logger.debug("Starting command unbundle");
        
        // Call install
        commandUnbundle(package, "", end);
        break;      
        
    case "register":
        logger.debug("Starting command register");

        // Call install
        commandRegister("", end);
        break;          
        
    default:
        help.show(command);
        break;
}

// Install command

function end() {
    console.log(chalk.green("Finished!"));
}
