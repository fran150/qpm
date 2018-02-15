var bower = require('bower');
var chalk = require('chalk');
var inquirer = require('inquirer');

function log(data, spaces, callback) {
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
}

function error(data) {
    console.log(chalk.red("Error:"));
    console.log(chalk.red("%j"), data);
}

function prompt(prompts, callback) {
    inquirer.prompt(prompts).then(callback);
}

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
        var install = bower.commands.install(dependencies, { save: save }, { interactive: true })
            .on('end', function(data) {
                if (debug) {
                    console.log(chalk.yellow("Received Bower Package:"));
                    console.log(chalk.yellow("%s"), JSON.stringify(data, null, 4));
                }

                callback(data);
            })
            .on('log', function(data, callback) {
                log(data, spaces, callback);
            })
            .on('error', error)
            .on('prompt', prompt);
    },

    // Call bower list
    list: function (spaces, debug, callback) {
        spaces = spaces || "";

        // Call bower list command
        var list = bower.commands.list([], {}, { interactive: true })
            .on('end', function (data) {
                if (debug) {
                    console.log(chalk.yellow("Finished listing bower packages"));
                }

                callback(data);
            })
            .on('log', function (data, callback) {
                log(data, spaces, callback);
            })
            .on('error', error)
            .on('prompt', prompt);
    },

    // Call bower install for the specified dependency
    uninstall: function (dependency, save, spaces, debug, callback) {
        spaces = spaces || "";

        var dependencies = new Array();

        if (dependency) {
            dependencies.push(dependency);
            console.log(chalk.cyan(spaces + "Bower Checking %s..."), dependency);
        }

        // Call bower install command
        var uninstall = bower.commands.uninstall(dependencies, { save: save }, { interactive: true })
            .on('end', function (data) {
                if (debug) {
                    console.log(chalk.yellow("Uninstalled Bower Package:"));
                    console.log(chalk.yellow("%s"), JSON.stringify(data, null, 4));
                }

                callback(data);
            })
            .on('log', function (data, callback) {
                logUninstall(data, spaces, callback);
            })
            .on('error', error)
            .on('prompt', prompt);
    },    
}
