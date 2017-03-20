var bower = require('bower');
var chalk = require('chalk');

module.exports = {
    // Call bower install for the specified dependency
    install: function(dependency, save, spaces, debug, callback) {
        spaces = spaces || "";

        console.log(chalk.cyan(spaces + "Bower Checking %s..."), dependency);

        // Set command options
        var options = [];

        // If save flag add the --save option to the install command
        if (save) {
            options.push("save");
        }

        // Call bower install command
        var install = bower.commands.install([dependency], options)
            .on('end', function (data) {
                if (debug) {
                    console.log(chalk.yellow("Received Bower Package:"));
                    console.log(chalk.yellow("%s"), JSON.stringify(data, null, 4));
                }

                callback(data);
            })
            .on('error', function(data) {
                console.log(chalk.red("Error:"));
                console.log(chalk.red("%j"), data);
            });
    }
}
