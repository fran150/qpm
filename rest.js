var merge = require('merge');
var http = require('http');
const chalk = require('chalk');

// Default config
// TODO: Move to some file!
var config = {
    packages: {
        host: "localhost",
        port: 58930
    },
    http: {
    }
}

module.exports = {
    // Get the specified package config from service
    getPackage: function(name, spaces, debug, callback) {
        spaces = spaces || "";

        // Set request config
        var httpConfig = {
            host: config.packages.host,
            port: config.packages.port,
            method: "GET",
            path: "/package/" + name
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
                var data = JSON.parse(response);

                var config;

                if (Array.isArray(data) && data.length > 0) {
                    config = data[0];
                } else {
                    config = data;
                }

                callback(config);
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
