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
function bundleCommand(package, spaces, callback) {
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

                        if (bundleConfig.isAutoBundled(package, gulpConf)) {
                            msg = "The specified package has been already auto bundled";
                            logger.error(msg);
                            reject(msg);
                        } else {
                            resolve(gulpConf);
                        }                        
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
    var readQuarkConfigPromise = Q.Promise(function(resolve, reject) {
        bower.list(spaces + "  ").then(function(mods) {
            let mod = mods[package];
            
            if (mod) {
                logger.debug("Bower package found " + chalk.bold.green(package), spaces);                
                logger.verbose(JSON.stringify(mod, null, 4));
            }

            if (mod && mod.dir) {
                logger.debug("Trying to read file " + chalk.bold.green(mod.dir + "/quark.json"));

                fs.readFile(mod.dir + "/quark.json", "utf8", function(err, quarkFileContent) {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            logger.debug("Quark config file not found.", spaces);

                            resolve();
                        } else {
                            logger.error("Error reading " + mod.name + " quark.json file.");
                            reject(err);    
                        }
                    } else {
                        try {
                            logger.info("Quark config file found for " + chalk.bold.green(mod.name), spaces);
                            logger.verbose(quarkFileContent);
                            
                            var quarkConfig = {
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
            } else {
                resolve();
            }            
        })
        .catch(function(error) {
            logger.error("Error executing bower list");
            reject(error);
        });
    });
    
    var configureGulpPromise = Q.Promise(function(resolve, reject) {
        Q.all([readGulpConfPromise, readQuarkConfigPromise]).then(function(results) {
            var gulpConf = results[0];
            var quarkConf = results[1];

            if (quarkConf) {
                var merged = merge(quarkConf.config.bundling, gulpConf, true);
                merged = bundleConfig.markAutoBundled(package, merged);

                resolve(merged);
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
                    logger.error("Error Writing File!");
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

module.exports = bundleCommand;