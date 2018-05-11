var fs = require('fs');
var chalk = require('chalk');
var Q = require('q');
var merge = require('merge-array-object');

var args = require('./arguments');
var quarkConfig = require('./quark-config');
var rest = require('./rest');
var bower = require('./bower-node');
var quarkConfigurator = require('./quark-configurator');

// Install command
function bundleCommand(package, spaces, callback) {
    spaces = spaces || "";

    // Gets the base dir
    var baseDirPromise = args.getBaseDir(spaces + "  ");

    // Get quark's config for each bower listed package
    var gulpConfigPromise = Q.Promise(function(resolve, reject) {
        bower.info(package, spaces + "  ").then(function() {
            if (args.isVerbose()) {
                console.log(chalk.white(mods));
            }            
        })
        .catch(function(error) {
            console.log(chalk.red("Error executing bower install"));
            reject(error);
        });
    })
    
    /*
    // With the quark config file and the quark configuration for each module
    var configureQuarkPromise = Q.all([readQuarkConfigPromise, packageConfigPromise, baseDirPromise]).then(function(results) {
        // Get the bower config file
        var fileContent = results[0];
        var bowerConfigs = results[1];
        var baseDir = results[2];

        // Wait for all quark configs are ready and apply to the quark's config file
        for (var name in bowerConfigs) {
            var bowerConfig = bowerConfigs[name];

            if (bowerConfig.quark) {
                // Add package to quarks config
                fileContent = quarkConfigurator.addPackage(bowerConfig.quark, bowerConfig, fileContent, spaces + "  ", baseDir);
            }
        }

        return fileContent;
    });

    // When all the configuration is done write the config file.
    Q.all([configureQuarkPromise, configPathPromise]).then(function(results) {
        var quarkConfigContent = results[0];
        var configPath = results[1];
        
        if (args.isDebug()) {
            console.log(chalk.yellow("Writing config file:"));
            console.log(chalk.yellow("%s"), configPath);
        }

        // Write the modified target file
        fs.writeFile(configPath, quarkConfigContent, 'utf8', function (err) {
            if (err) {
                console.log(chalk.red("Error Writing File:"));
                console.log(chalk.red("%j"), err);
            }
        });
    })*/
    .catch(function(error) {
        throw new Error(error);
    })
    .done();        
}

module.exports = bundleCommand;
