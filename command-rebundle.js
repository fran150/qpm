var fs = require('fs');
var chalk = require('chalk');
var Q = require('q');
var merge = require('merge-array-object');

var args = require('./arguments');
var rest = require('./rest');
var bower = require('./bower-node');
var utils = require('./utils');

// Install command
function rebundleCommand(package, spaces, callback) {
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
    var readQuarkConfigPromises = bower.list(spaces + "  ").then(function(mods) {
        var promises = new Array();

        for (let name in mods) {
            let mod = mods[name];
            
            promises.push(Q.Promise(function(resolve, reject) {
                if (args.isDebug()) {
                    console.log(chalk.yellow(spaces + "Trying to read file " + chalk.white(mod.dir + "/quark.json")));
                }
    
                fs.readFile(mod.dir + "/quark.json", "utf8", function(err, quarkFileContent) {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            if (args.isDebug()) {
                                console.log(chalk.yellow(spaces + "Quark config file not found for " + chalk.white(mod.name)));
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
                            
                            let quarkConfig = {
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
            }));
        }

        return promises;
    })
    .catch(function(error) {
        console.log(chalk.red("Error executing bower list"));        
        throw new Error(error);
    });
    
    var configureGulpPromise = Q.Promise(function(resolve, reject) {
        Q.all([readGulpConfPromise, readQuarkConfigPromises]).then(function(results) {
            let gulpConf = results[0];
            let quarkConfigPromises = results[1];

            Q.all(quarkConfigPromises).then(function(quarkConfs) {
                var merged = gulpConf;

                for (let i = 0; i < quarkConfs.length; i++) {
                    let quarkConf = quarkConfs[i];

                    if (quarkConf) {
                        if (!utils.isAutoBundled(quarkConf.name, merged)) {
                            console.log(spaces + chalk.green("Bundling " + chalk.white(quarkConf.name)));
                            merged = merge(quarkConf.config.bundling, merged, true);
                            merged = utils.markAutoBundled(quarkConf.name, merged);
                        } else {
                            console.log(spaces + chalk.blue("Quark package " + chalk.white(quarkConf.name) + " is already auto bundled."))
                        }
                    }
                }

                resolve(merged);
            })
            .catch(function(error) {
                reject(error);
            });                
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

module.exports = rebundleCommand;
