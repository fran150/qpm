var fs = require('fs');
var chalk = require('chalk');
var Q = require('q');
var merge = require('merge-array-object');

var args = require('./arguments');
var rest = require('./rest');
var bower = require('./bower-node');
var utils = require('./utils');

// Install command
function unbundleCommand(package, spaces, callback) {
    spaces = spaces || "";

    // Gets the gulp config file location
    var gulpConfPathPromise = args.getGulpConfPath(spaces + "  ");

    // Gets the base dir
    var baseDirPromise = args.getBaseDir(spaces + "  ");

    var readGulpConfPromise = Q.Promise(function(resolve, reject) {
        gulpConfPathPromise.then(function(gulpConfPath) {

            fs.readFile(gulpConfPath, "utf8", function(err, gulpConfContent) {
                if (err) {
                    console.log(chalk.red("Error reading gulp conf file."));
                    reject(err);
                } else {
                    try {
                        var gulpConf = JSON.parse(gulpConfContent);
                        resolve(gulpConf);
                    } catch(ex) {
                        console.log(chalk.red("Error parsing gulp conf file"));
                        reject(ex);
                    }
                }
            })
        }).catch(function(error) {
            console.log(chalk.red("Error verifying gulp conf path"));
            reject(error);
        });
    });

    // Get quark's config for each bower listed package
    var readQuarkConfigPromise = Q.Promise(function(resolve, reject) {
        bower.list(spaces + "  ").then(function(mods) {
            let mod = mods[package];

            if (mod) {                
                if (args.isDebug()) {
                    console.log(chalk.yellow(spaces + "Bower package found " + chalk.white(package)));
                
                    if (args.isVerbose()) {
                        console.log("%j", JSON.stringify(mod));
                    }
                }
            }

            if (mod && mod.dir) {
                if (args.isDebug()) {
                    console.log(chalk.yellow(spaces + "Trying to read file " + chalk.white(mod.dir + "/quark.json")));
                }

                fs.readFile(mod.dir + "/quark.json", "utf8", function(err, quarkFileContent) {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            if (args.isDebug()) {
                                console.log(chalk.yellow(spaces + "Quark config file not found."));
                            }
                            
                            resolve();
                        } else {
                            console.log(chalk.red("Error reading " + mod.name + " quark.json file."));
                            reject(err);    
                        }
                    } else {
                        try {
                            console.log(chalk.green(spaces + "Quark config file found for " + chalk.white(mod.name)));
                            
                            if (args.isDebug()) {
                                if (args.isVerbose()) {
                                    console.log(quarkFileContent);
                                }
                            }
                            
                            var quarkConfig = {
                                name: mod.name,
                                config: JSON.parse(quarkFileContent)
                            }

                            resolve(quarkConfig);
                        } catch(ex) {
                            console.log(chalk.red("Error parsing gulp conf file"));
                            reject(ex);
                        }
                    }    
                });
            } else {
                resolve();
            }            
        })
        .catch(function(error) {
            console.log(chalk.red("Error executing bower list"));
            reject(error);
        });
    });

    function getAllFiles(config, files, parentProperty) {
        var f = files || {};
        var n = parentProperty || "";

        if (utils.isObject(config)) {
            for (var name in config) {
                getAllFiles(config[name], f, name);
            }
        } else if (utils.isArray(config)) {
            for (var i = 0; i < config.length; i++) {
                f[config[i]] = n;
            }
        }

        return f;
    }

    function hasProperty(object) {
        for (var name in object) {
            return true;
        }

        return false;
    }

    function deleteFiles(config, files) {
        if (utils.isObject(config)) {
            for (var name in config) {
                deleteFiles(config[name], files);

                if (utils.isArray(config[name]) && config[name].length == 0) {
                    delete config[name];
                } else if (utils.isObject(config[name]) && !hasProperty(config[name])) {
                    delete config[name];
                }
            }
        } else if (utils.isArray(config)) {
            for (var i = config.length - 1; i >= 0; i--) {
                if (files[config[i]]) {
                    config.splice(i, 1);
                }
            }

            if (config.length == 0) {
                delete config;
            }
        }

        return config;
    }
    
    var configureGulpPromise = Q.Promise(function(resolve, reject) {
        Q.all([readGulpConfPromise, readQuarkConfigPromise]).then(function(results) {
            var gulpConf = results[0];
            var quarkConf = results[1];

            if (quarkConf) {
                console.log(spaces + chalk.green("Unbundling package ") + chalk.white(package));

                var files = getAllFiles(quarkConf);
                gulpConf = deleteFiles(gulpConf, files);

                gulpConf = utils.unmarkAutoBundled(package, gulpConf);

                resolve(gulpConf);
            } else {
                resolve(gulpConf);
            }            
        })
        .catch(function(error) {
            reject(error);
        });
    });


    var writeGulpFile = Q.Promise(function(resolve, reject) {
        Q.all([gulpConfPathPromise, configureGulpPromise]).then(function(results) {
            var path = results[0];

            var content = JSON.stringify(results[1], null, 4);
    
            fs.writeFile(path, content, 'utf8', function (err) {
                if (err) {
                    console.log(chalk.red("Error Writing File:"));
                    console.log(chalk.red("%j"), err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        })    
        .catch(function(error) {
            reject(error);
        });
    });

    writeGulpFile.then(function() {
        console.log(chalk.green("Gulp file updated!"));
    })
    .catch(function(error) {
        throw new Error(error);
    })
    .done();        
}

module.exports = unbundleCommand;
