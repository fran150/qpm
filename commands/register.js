var Q = require('q');
var chalk = require('chalk');
var fs = require('fs');

var logger = require("../utils/logger");
var login = require("../auth/login");
var rest = require('../utils/rest');


function commandRegister(spaces, callback) {
    spaces = spaces || "";

    function readAndParseJsonFile(name) {
        return Q.Promise(function(resolve, reject) {
            logger.debug("Reading " + name + " file");
            fs.readFile(name, 'utf8', function(err, content) {
                if (err) {
                    reject(err);
                } else {
                    try {
                        logger.verbose(content);
                        
                        logger.debug("Parsing " + name);
                        var quarkData = JSON.parse(content);
                        resolve(quarkData);
                    }
                    catch(error) {
                        reject("Error parsing " + name + " file");
                    }
                }
            });
        });
    }
    
    var loginPromise = login(spaces + "  ");
    var bowerPromise = readAndParseJsonFile('bower.json');
    var quarkPromise = readAndParseJsonFile('quark.json');
    
    Q.all([loginPromise, bowerPromise, quarkPromise]).then(function(results) {
        var loginInfo = results[0];
        var bowerData = results[1];
        var quarkData = results[2];

        if (quarkData && quarkData.package) {
            package = quarkData.package;
            package.name = bowerData.name;

            rest.registerPackage(package, loginInfo.token, spaces + "  ").then(function(data) {
                logger.info("Package " + chalk.bold.magenta(package.name) + " Registered!");
            })      
            .catch(function(error) {
                throw error;
            });    
        }
    })    
    .catch(function(error) {
        throw new Error(error);
    })
    .done();
}

module.exports = commandRegister;

