var logger = require('./utils/logger');

// Get required libs
var commandInstall = require('./commands/install');
var commandUninstall = require('./commands/uninstall');
var commandLink = require('./commands/link');
var commandBundle = require('./commands/bundle');
var commandRebundle = require('./commands/rebundle');
var commandUnbundle = require('./commands/unbundle');
var commandRegister = require('./commands/register');

function validatePackage(package) {
    if (!package) {
        logger.error("Must specify a package name");
        throw new Error("Package name not specified");
    }
}

module.exports = {
    install: function(package, args, callback) {
        logger.debug("Starting command install");
        commandInstall(package, "", args, callback);
    },

    uninstall: function(package, callback) {
        validatePackage(package);
        logger.debug("Starting command uninstall");
        commandUninstall(package, "", callback);
    },

    link: function(package, callback) {
        validatePackage(package);
        logger.debug("Starting command link");
        commandLink(package, "", callback);
    },

    bundle: function(package, callback) {
        validatePackage(package);
        logger.debug("Starting command bundle");
        commandBundle(package, "", callback);
    },

    rebundle: function(callback) {
        logger.debug("Starting command rebundle");
        commandRebundle(package, "", callback);
    },
        
    unbundle: function(package, callback) {
        validatePackage(package);
        logger.debug("Starting command unbundle");
        commandUnbundle(package, "", callback);
    },

    register: function(callback) {
        logger.debug("Starting command register");
        commandRegister("", callback);
    }
}