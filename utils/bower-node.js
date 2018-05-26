var bower = require('bower');
var chalk = require('chalk');
var inquirer = require('inquirer');
var Q = require('Q');

var logger = require("./utils/logger");

function log(data, spaces, callback) {
    var output = "";

    if (data.level == 'action') {
        output += spaces + "   " + chalk.cyan(data.id);

        if (data.data && data.data.pkgMeta) {
            output += " [" + chalk.white(data.data.pkgMeta.name) + "]";
        }
    }

    if (data.level == 'conflict') {
        logger.bower(data.message, spaces + "    ");

        for (var i = 0; i < data.data.picks.length; i++) {
            var pick = data.data.picks[i];
            var pkg = pick.pkgMeta;

            logger.bower((i + 1) + ") " + pkg.name + "#" + pkg.version, spaces + "       ");

            for (var j = 0; j < pick.dependants.length; j++) {
                var dep = pick.dependants[j].pkgMeta;

                logger.bower("Depends " + dep.name + "#" + dep.version, spaces + "         ");
            }
        }
    }

    if (output) {
        logger.bower(output);
    }
}

function logUninstall(data, spaces, callback) {
    var output = "";

    if (data.level == 'action') {
        output += spaces + "   " + chalk.cyan(data.id);

        if (data.data && data.data.name) {
            output += " [" + chalk.white(data.data.name) + "]";
        }
    }

    if (data.level == 'conflict') {
        logger.bower(data.message, spaces + "    ");

        for (var i = 0; i < data.data.picks.length; i++) {
            var pick = data.data.picks[i];
            var pkg = pick.pkgMeta;

            logger.bower((i + 1) + ") " + pkg.name + "#" + pkg.version, spaces + "       ");

            for (var j = 0; j < pick.dependants.length; j++) {
                var dep = pick.dependants[j].pkgMeta;

                logger.bower("Depends " + dep.name + "#" + dep.version, spaces + "         ");
            }
        };
    }

    if (output) {
        logger.bower(output);
    }
}

function error(data) {
    logger.error("Error:");
    logger.error(JSON.stringify(data, null, 4));
}

function prompt(prompts, callback) {
    inquirer.prompt(prompts).then(callback);
}

function processBowerListResult(data, result, spaces) {
    if (data.missing !== true) {
        logger.debug("On listing found bower package: " + chalk.bold.green(data.pkgMeta.name), spaces);

        result[data.pkgMeta.name] = {
            name: data.pkgMeta.name,
            dir: data.canonicalDir,
            version: data.pkgMeta.version
        };
    
        if (data.dependencies) {
            for (var index in data.dependencies) {
                result = processBowerListResult(data.dependencies[index], result, spaces);
            }            
        }                    
    }
    
    return result;
}

module.exports = {
    // Call bower install for the specified dependency
    install: function(dependency, save, spaces) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";
        
            var dependencies = new Array();
    
            if (dependency) {
                dependencies.push(dependency);
                logger.bower("Install " + dependency + "...");
            }

            logger.debug("Calling bower install");

            // Call bower install command
            var install = bower.commands.install(dependencies, { save: save }, { interactive: true })
                .on('end', function(data) {                    
                    if (data && data.name) {
                        logger.debug("Received bower package: " + chalk.white(data.name), spaces);
                        logger.verbose(JSON.stringify(data, null, 4));
                    }                    

                    var result = {};
        
                    for (var name in data) {
                        logger.bower("Installed: [", chalk.green(name), "]", spaces);

                        result[name] = {
                            name: name,
                            dir: data[name].canonicalDir,
                            version: data[name].pkgMeta.version
                        };
                    }
                
                    resolve(data);
                })
                .on('log', function(data, callback) {
                    log(data, spaces, callback);
                })
                .on('error', function(data) {
                    error(data);
                    reject(new Error(data));
                })
                .on('prompt', prompt);    
        })
    },

    // Call bower list
    list: function (spaces) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";

            logger.debug("Calling bower list", spaces);
            
            // Call bower list command
            var list = bower.commands.list([], {}, { interactive: true })
                .on('end', function (data) {
                    logger.debug("Finished listing bower packages", spaces);

                    var result = {};

                    processBowerListResult(data, result, spaces + "  ");
  
                    resolve(result);
                })
                .on('log', function (data, callback) {
                    log(data, spaces, callback);
                })
                .on('error', function(data) { 
                    error(data);
                    reject(new Error(data));
                })
                .on('prompt', prompt);    
        })
    },

    // Call bower install for the specified dependency
    uninstall: function (dependency, save, spaces) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";

            var dependencies = new Array();
    
            if (dependency) {
                dependencies.push(dependency);
                logger.bower("Uninstall " + dependency + "...");
            }
    
            // Call bower install command
            var uninstall = bower.commands.uninstall(dependencies, { save: save }, { interactive: true })
                .on('end', function (data) {
                    if (data && data.name) {
                        logger.debug("Uninstalled bower package: " + chalk.white(data.name));
                        logger.verbose(JSON.stringify(data, null, 4));
                    }
    
                    resolve(data);
                })
                .on('log', function (data, callback) {
                    logUninstall(data, spaces, callback);
                })
                .on('error', function(data) {
                    error(data);
                    reject(new Error(data));
                })
                .on('prompt', prompt);    
        });
    },    

    // Call bower link for the specified dependency
    link: function(dependency, spaces) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";
        
            var dependencies = new Array();
    
            if (dependency) {
                dependencies.push(dependency);
                logger.bower("Link " + dependency + "...", spaces);
            }

            logger.debug("Calling bower link", spaces);

            // Call bower install command
            var link = bower.commands.link(dependency, undefined, { interactive: true })
                .on('end', function(data) {
                    if (data && data.name) {
                        logger.debug("Linked bower package: " + dependency, spaces);
                        logger.verbose(JSON.stringify(data, null, 4));
                    }

                    var result = {};
        
                    logger.bower("Linked: [" + chalk.bold.green(dependency) + "]", spaces);
                    
                    result[dependency] = {
                        name: dependency,
                        dir: data["dst"],
                        version: ''
                    };
                
                    resolve(data);
                })
                .on('log', function(data, callback) {
                    log(data, spaces, callback);
                })
                .on('error', function(data) {
                    error(data);
                    reject(new Error(data));
                })
                .on('prompt', prompt);    
        })
    },

    // Call bower info for the specified dependency
    info: function(dependency, spaces) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";
        
            var dependencies = new Array();
    
            if (dependency) {
                dependencies.push(dependency);
                logger.bower("Bower link " + dependency + "...", spaces);
            }

            logger.debug("Calling bower info", spaces);

            // Call bower install command
            var info = bower.commands.info(dependency, undefined, { interactive: true })
                .on('end', function(data) {
                    if (data && data.name && args.isDebug()) {
                        logger.debug("Info bower package: " + chalk.bold.green(dependency));
                        logger.verbose(JSON.stringify(data, null, 4));
                    }

                    var result = {};
        
                    logger.bower("Info: [", chalk.bold.green(dependency), "]", spaces);

                    result[dependency] = {
                        name: dependency,
                        dir: data["dst"],
                        version: ''
                    };
                
                    resolve(data);
                })
                .on('log', function(data, callback) {
                    log(data, spaces, callback);
                })
                .on('error', function(data) {
                    error(data);
                    reject(new Error(data));
                })
                .on('prompt', prompt);    
        })
    },

    // Call bower lookup for the specified dependency
    lookup: function(dependency, spaces) {
        return Q.Promise(function(resolve, reject) {
            spaces = spaces || "";
        
            var dependencies = new Array();
    
            if (dependency) {
                dependencies.push(dependency);
                logger.bower("Bower lookup " + dependency + "...", spaces);
            }

            logger.debug("Calling bower lookup", spaces);
            
            // Call bower install command
            var info = bower.commands.lookup(dependency, undefined, { interactive: true })
                .on('end', function(data) {
                    if (data && data.name) {
                        logger.debug("Lookup bower package: " + chalk.bold.green(dependency));
                        logger.verbose(JSON.stringify(data, null, 4));
                    }        
                
                    resolve(data);
                })
                .on('log', function(data, callback) {
                    log(data, spaces, callback);
                })
                .on('error', function(data) {
                    error(data);
                    reject(new Error(data));
                })
                .on('prompt', prompt);    
        })
    } 
}
