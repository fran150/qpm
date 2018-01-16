var bower = require('bower');
var chalk = require('chalk');
var inquirer = require('inquirer');

module.exports = {
    // Call bower install for the specified dependency
    install: function(dependency, save, spaces, debug, callback) {
        spaces = spaces || "";
        
        var dependencies = new Array();

        if (dependency) {
            dependencies.push(dependency);
            console.log(chalk.cyan(spaces + "Bower Checking %s..."), dependency);
        }
        
        // Call bower install command
        var install = bower.commands.install(dependencies, { save: true }, { interactive: true })
            .on('end', function(data) {
                if (debug) {
                    console.log(chalk.yellow("Received Bower Package:"));
                    console.log(chalk.yellow("%s"), JSON.stringify(data, null, 4));
                }

                callback(data);
            })
            .on('log', function(data, callback) {
                var output = "";

                if (data.level == 'action') {
                    output += spaces + "   " + chalk.cyan(data.id);

                    if (data.data && data.data.pkgMeta) {
                        output += " [" + chalk.white(data.data.pkgMeta.name) + "]";
                    }
                }

                if (data.level == 'conflict') {
                    console.log(spaces + "    " + data.message);

                    for (var i = 0; i < data.data.picks.length; i++) {
                        var pick = data.data.picks[i];
                        var pkg = pick.pkgMeta;

                        console.log(spaces + "       " + (i + 1) + ") " + pkg.name + "#" + pkg.version);

                        for (var j = 0; j < pick.dependants.length; j++) {
                            var dep = pick.dependants[j].pkgMeta;

                            console.log(spaces + "         Depends " + dep.name + "#" + dep.version);
                        }
                    };
                }

                if (output) {
                    console.log(output);
                }

            })
            .on('error', function(data) {
                console.log(chalk.red("Error:"));
                console.log(chalk.red("%j"), data);
            })
            .on('prompt', function (prompts, callback) {
                inquirer.prompt(prompts).then(callback);
            });
    },

    // Call bower list
    list: function (spaces, debug, callback) {
        spaces = spaces || "";

        // Call bower list command
        var list = bower.commands.list([], {}, { interactive: true })
            .on('end', function (data) {
                if (debug) {
                    console.log(chalk.yellow("Received Bower Package:"));
                    console.log(chalk.yellow("%s"), JSON.stringify(data, null, 4));
                }

                callback(data);
            })
            .on('log', function (data, callback) {
                var output = "";

                if (data.level == 'info') {
                    output += spaces + "   " + chalk.green(data.message);
                }

                if (data.level == 'action') {
                    output += spaces + "   " + chalk.cyan(data.id);

                    if (data.data && data.data.pkgMeta) {
                        output += " [" + chalk.white(data.data.pkgMeta.name) + "]";
                    }
                }

                if (data.level == 'conflict') {
                    console.log(spaces + "    " + data.message);

                    for (var i = 0; i < data.data.picks.length; i++) {
                        var pick = data.data.picks[i];
                        var pkg = pick.pkgMeta;

                        console.log(spaces + "       " + (i + 1) + ") " + pkg.name + "#" + pkg.version);

                        for (var j = 0; j < pick.dependants.length; j++) {
                            var dep = pick.dependants[j].pkgMeta;

                            console.log(spaces + "         Depends " + dep.name + "#" + dep.version);
                        }
                    };
                }

                if (output) {
                    console.log(output);
                }

            })
            .on('error', function (data) {
                console.log(chalk.red("Error:"));
                console.log(chalk.red("%j"), data);
            })
            .on('prompt', function (prompts, callback) {
                inquirer.prompt(prompts).then(callback);
            });
    }
}
