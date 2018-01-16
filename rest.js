var merge = require('merge');
var http = require('http');
const chalk = require('chalk');
var qpmrc = require('./qpmrc');

module.exports = {
    // Get the specified package config from service
    getPackage: function(name, spaces, debug, callback) {
        spaces = spaces || "";

        var config = qpmrc.read();

        // Set request config
        var httpConfig = {
            host: config.packages.host,
            port: config.packages.port,
            method: "GET",
            path: config.packages.path + name.split('.').join('')
        }

        // Merge with default options
        httpConfig = merge(httpConfig, config.http);

        // Service response
        var response = "";

        // Make an HTTP Request to the package service
        var req = http.request(httpConfig, (res) => {
            res.setEncoding('utf8');

            // On data received append to response
            res.on('data', (chunk) => {
                response += chunk;
            });

            // On request end invoke callback
            res.on('end', () => {
                try {
                    var data = JSON.parse(response);

                    var config;

                    if (Array.isArray(data) && data.length > 0) {
                        config = data[0];
                    } else {
                        config = data;
                    }

                    callback(config);
                } catch(ex) {
                    console.log(chalk.red("Error parsing quark config for package " + name));
                    throw ex;
                }
            });
        });

        // On request error show
        req.on('error', (e) => {
            console.log(chalk.red(`Error retrieving package info: ${ e.message }`));
        });

        // End the HTTP Request
        req.end();
    }
}
