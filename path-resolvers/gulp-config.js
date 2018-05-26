var Q = require('q');
var chalk = require('chalk');

var logger = require('../utils/logger');
var qpmrc = require('../utils/qpmrc');
var utils = require('../utils/utils');

var argv = require('minimist')(process.argv.slice(2));

// Gets the gulp config file
function getGulpConfPath(spaces) {
    return Q.Promise(function(resolve, reject) {
        let gulpJsonFile;

        // Check for gulp file parameter
        if (argv["g"]) {
            gulpJsonFile = argv["g"];
        }

        // Check for bundles parameters
        if (!gulpJsonFile && argv["gulpfile"]) {
            gulpJsonFile = argv["gulpfile"];
        }

        // If no bundling json specified set the default location
        if (!gulpJsonFile || gulpJsonFile === true) {
            gulpJsonFile = "./gulp.conf.json";

            logger.debug("Gulp config file location not specified by argument. Using default config.", spaces);
        } else {
            logger.debug("Gulp config file location specified by argument:" + chalk.bold.green(gulpJsonFile), spaces);
        }

        logger.debug("Checking if gulp config file exists.", spaces);
        
        // If base dir specified as argument check if exists
        utils.fileExists(gulpJsonFile).then(function(exists) {
            if (exists) {
                logger.debug("Gulp conf file found!", spaces);
                        
                resolve(gulpJsonFile);
            } else {
                var msg = "Gulp config file not found. If not using standard location use -g argument to specify the path";
                logger.error(msg);
                reject(msg);
            }
        })
        .catch(function(error) {
            logger.error("Error trying to found if gulp config file exists");
            reject(error);
        })
    })
}

module.exports = getGulpConfPath;