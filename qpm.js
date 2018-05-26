#!/usr/bin/env node
var chalk = require('chalk');
var help = require('./help');

var logger = require('./logger');

// Get required libs
var commandInstall = require('./command/install');
var commandUninstall = require('./command/uninstall');
var commandLink = require('./command/link');
var commandBundle = require('./command/bundle');
var commandRebundle = require('./command/rebundle');
var commandUnbundle = require('./command/unbundle');
var commandRegister = require('./command/register');

// Get command "qpm [command]"
var command = argv["_"][0];

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
        var package = argv["_"][1];

        logger.debug("Starting command install");

        // Call install
        commandInstall(package, "", end);
        break;

    case "uninstall":
        // Get package name
        var package = argv["_"][1];

        logger.debug("Starting command uninstall");

        // Call install
        commandUninstall(package, "", end);
        break;

    case "link":
        // Get package name
        var package = argv["_"][1];

        logger.debug("Starting command link");
                
        // Call install
        commandLink(package, "", end);
        break;

    case "bundle":
        // Get package name
        var package = argv["_"][1];

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
        var package = argv["_"][1];

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
