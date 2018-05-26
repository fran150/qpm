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
function unbundleCommand(package, spaces, callback) {
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
                        logger.error("Error parsing gulp conf file.");
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

            logger.debug("Bower package found " + chalk.bold.green(package));
            logger.verbose(JSON.stringify(mod, null, 4));

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
                logger.info("Unbundling package " + chalk.bold.green(package), spaces);

                var files = getAllFiles(quarkConf);
                gulpConf = deleteFiles(gulpConf, files);

                gulpConf = bundleConfig.unmarkAutoBundled(package, gulpConf);

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
                    logger.error("Error Writing File");
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

module.exports = unbundleCommand;
