var fs = require('fs');
var chalk = require('chalk');
var Q = require('q');
var merge = require('merge-array-object');

var getGulpConfPath = require('../path-resolvers/gulp-config');

var logger = require('../utils/logger');
var rest = require('../utils/rest');
var bower = require('../utils/bower-node');
var utils = require('../utils/utils');
var bundleConfig = require('../utils/bundle-config');

// Install command
function rebundleCommand(package, spaces, callback) {
    spaces = spaces || "";

    // Gets the gulp config file location
    var gulpConfPathPromise = getGulpConfPath(spaces + "  ");

    var readGulpConfPromise = Q.Promise(function(resolve, reject) {
        gulpConfPathPromise.then(function(gulpConfPath) {

            fs.readFile(gulpConfPath, "utf8", function(err, gulpConfContent) {
                if (err) {
                    logger.error("Error reading gulp conf file.");
                    reject(err);
                } else {
                    try {
                        var gulpConf = JSON.parse(gulpConfContent);
                        resolve(gulpConf);
                    } catch(ex) {
                        logger.error("Error parsing gulp conf file");
                        reject(ex);
                    }
                }
            })
        }).catch(function(error) {
            logger.error("Error verifying gulp conf path");
            reject(error);
        });
    });

    // Get quark's config for each bower listed package
    var readQuarkConfigPromises = bower.list(spaces + "  ").then(function(mods) {
        var promises = new Array();

        for (let name in mods) {
            let mod = mods[name];
            
            promises.push(Q.Promise(function(resolve, reject) {
                logger.debug("Trying to read file " + chalk.bold.green(mod.dir + "/quark.json"), spaces);
    
                fs.readFile(mod.dir + "/quark.json", "utf8", function(err, quarkFileContent) {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            logger.debug("Quark config file not found for " + chalk.white(mod.name), spaces);
                            
                            resolve();
                        } else {
                            logger.error("Error reading " + mod.name + " quark.json file.");
                            reject(err);    
                        }
                    } else {
                        try {
                            logger.info("Quark config file found for " + chalk.bold.green(mod.name));
                            logger.verbose(quarkFileContent);
                            
                            let quarkConfig = {
                                name: mod.name,
                                config: JSON.parse(quarkFileContent)
                            }

                            resolve(quarkConfig);
                        } catch(ex) {
                            logger.error("Error parsing gulp conf file");
                            reject(ex);
                        }
                    }    
                });    
            }));
        }

        return promises;
    })
    .catch(function(error) {
        logger.error("Error executing bower list");
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
                        if (!bundleConfig.isAutoBundled(quarkConf.name, merged)) {
                            logger.info("Bundling " + chalk.bold.green(quarkConf.name), spaces);

                            merged = merge(quarkConf.config.bundling, merged, true);
                            merged = bundleConfig.markAutoBundled(quarkConf.name, merged);
                        } else {
                            logger.info("Quark package " + chalk.bold.green(quarkConf.name) + " is already auto bundled.");
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
                    logger.eror("Error writing file");
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
        logger.info("Gulp file updated!");
    })
    .catch(function(error) {
        throw new Error(error);
    })
    .done();        
}

module.exports = rebundleCommand;
