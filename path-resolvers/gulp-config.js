var Q = require('q');
var chalk = require('chalk');

var gulpFileExceptions = require('../exceptions/gulpFile.exceptions');

var logger = require('../utils/logger');
var utils = require('../utils/utils');

var argv = require('minimist')(process.argv.slice(2));

// Gets the gulp config file
function getGulpConfPath(spaces, args) {
    return Q.Promise(function(resolve, reject) {
        let gulpJsonFile;

        if (!args || args == null) {
            args = argv;
        }

        // Check for gulp file parameter
        if (args["g"]) {
            gulpJsonFile = args["g"];
        }

        // Check for bundles parameters
        if (!gulpJsonFile && args["gulpfile"]) {
            gulpJsonFile = args["gulpfile"];
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
                var ex = new gulpFileExceptions.GulpFileNotFoundException();
                logger.error(ex.message);
                reject(ex);
            }
        })
        .catch(function(error) {
            var ex = new gulpFileExceptions.CantCheckGulpFileExistenceException(gulpJsonFile, error);
            logger.error(ex.message);
            reject(ex);
        })
    })
}

module.exports = getGulpConfPath;