var Q = require('Q');
var fs = require('fs');
var chalk = require('chalk');
var merge = require('merge');

function getDefaultConfig() {
    return {
        server: "http://localhost:3000"
    }
}

var savedConfig;

function Qpmrc() {
    var self = this;

    this.read = function(debug, verbose, spaces) {        
        return Q.Promise(function(resolve, reject) {
            if (savedConfig) {
                resolve(savedConfig);
            } else {
                var rcFile = {};
            
                var target = "./.qpmrc";
    
                if (debug) {
                    console.log(chalk.yellow(spaces + "Reading .qpmrc file"))
                }
        
                fs.readFile(target, 'utf8', function(err, fileContent) {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            var config = getDefaultConfig();
    
                            if (debug) {
                                console.log(chalk.yellow(spaces + ".qpmrc file not found using default config"))
    
                                if (verbose) {
                                    console.log(chalk.yellow(config));
                                }
                            }
                            savedConfig = config;                            
                            resolve(config);
                        } else {                        
                            console.log(chalk.red("Error reading .qpmrc file"));                        
                            reject(new Error(err));
                        }
                    } else {
                        if (debug) {
                            console.log(chalk.yellow(spaces + ".qpmrc file found using for configuration"));
                        }
    
                        rcFile = JSON.parse(fileContent);
        
                        var config = merge.recursive(getDefaultConfig(), rcFile);
    
                        if (debug && verbose) {
                            console.log(chalk.yellow(config));
                        }
            
                        savedConfig = config;
                        resolve(config);
                    }
                });                    
            }
        });
    }
}

module.exports = new Qpmrc();